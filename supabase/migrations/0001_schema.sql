-- ============================================================================
-- Heal Digital Fellowships — Schema
-- Migration 0001: tables, helper functions, triggers.
-- Run this in the Supabase SQL editor (or via the Supabase CLI) FIRST,
-- then 0002_rls.sql, then 0003_storage.sql, then optionally 0004_seed.sql.
-- ============================================================================

-- gen_random_uuid() is available via pgcrypto (bundled with Supabase).
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Helper: keep updated_at fresh.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  locale      text not null default 'en' check (locale in ('en', 'ur')),
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- is_admin() — SECURITY DEFINER so it can read profiles without tripping RLS
-- (prevents infinite recursion in the profiles admin SELECT policy).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- Auto-create a profile whenever a new auth user is created.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Prevent privilege escalation: a non-admin can never change their own role.
-- ----------------------------------------------------------------------------
create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role; -- silently keep the old role
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_enforce_role on public.profiles;
create trigger trg_profiles_enforce_role
  before update on public.profiles
  for each row execute function public.enforce_profile_role();

-- ----------------------------------------------------------------------------
-- partners
-- ----------------------------------------------------------------------------
create table if not exists public.partners (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  contact_name     text,
  contact_email    text,
  seats_purchased  integer not null default 0 check (seats_purchased >= 0),
  seats_used       integer not null default 0 check (seats_used >= 0),
  notes            text,
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- fellowships
-- ----------------------------------------------------------------------------
create table if not exists public.fellowships (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  description   text,
  locale        text not null default 'en' check (locale in ('en', 'ur')),
  cover_color   text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- modules — ordered content units within a fellowship.
-- ----------------------------------------------------------------------------
create table if not exists public.modules (
  id                uuid primary key default gen_random_uuid(),
  fellowship_id     uuid not null references public.fellowships (id) on delete cascade,
  title             text not null,
  description       text,
  type              text not null check (type in ('explore', 'assessed', 'case_study', 'quiz')),
  order_index       integer not null default 0,
  asset_path        text not null,
  completion_rule   text not null default 'engagement'
                      check (completion_rule in ('engagement', 'reported')),
  -- min_seconds (engagement dwell threshold) + pass_score (reported).
  completion_config jsonb not null default '{}'::jsonb,
  is_required       boolean not null default true,
  created_at        timestamptz not null default now(),
  unique (fellowship_id, order_index)
);

create index if not exists idx_modules_fellowship on public.modules (fellowship_id, order_index);

-- ----------------------------------------------------------------------------
-- enrollment_codes — partner-sponsored seat codes.
-- ----------------------------------------------------------------------------
create table if not exists public.enrollment_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  partner_id    uuid not null references public.partners (id) on delete cascade,
  fellowship_id uuid not null references public.fellowships (id) on delete cascade,
  status        text not null default 'unused' check (status in ('unused', 'redeemed', 'revoked')),
  redeemed_by   uuid references auth.users (id) on delete set null,
  redeemed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_codes_partner on public.enrollment_codes (partner_id);
create index if not exists idx_codes_status on public.enrollment_codes (status);

-- ----------------------------------------------------------------------------
-- enrollments — a user's access to a fellowship (granted by redeeming a code).
-- ----------------------------------------------------------------------------
create table if not exists public.enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  fellowship_id       uuid not null references public.fellowships (id) on delete cascade,
  enrollment_code_id  uuid references public.enrollment_codes (id) on delete set null,
  created_at          timestamptz not null default now(),
  unique (user_id, fellowship_id)
);

create index if not exists idx_enrollments_user on public.enrollments (user_id);
create index if not exists idx_enrollments_fellowship on public.enrollments (fellowship_id);

-- ----------------------------------------------------------------------------
-- progress — per-user, per-module completion. Written ONLY server-side after
-- validation (see RLS: no client INSERT/UPDATE policy). Certificates depend
-- on this, so it must never be forgeable by the client.
-- ----------------------------------------------------------------------------
create table if not exists public.progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  module_id     uuid not null references public.modules (id) on delete cascade,
  fellowship_id uuid not null references public.fellowships (id) on delete cascade,
  status        text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  score         numeric(5, 2) check (score is null or (score >= 0 and score <= 100)),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (user_id, module_id)
);

create index if not exists idx_progress_user on public.progress (user_id);
create index if not exists idx_progress_fellowship on public.progress (user_id, fellowship_id);

drop trigger if exists trg_progress_updated_at on public.progress;
create trigger trg_progress_updated_at
  before update on public.progress
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- certificates — immutable, publicly verifiable records.
-- Core fields are snapshotted at issue time so the record is self-describing.
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id                uuid primary key default gen_random_uuid(), -- public verification id
  user_id           uuid not null references auth.users (id) on delete cascade,
  fellowship_id     uuid not null references public.fellowships (id) on delete restrict,
  recipient_name    text not null,
  fellowship_title  text not null,
  issued_at         timestamptz not null default now(),
  status            text not null default 'valid' check (status in ('valid', 'revoked')),
  unique (user_id, fellowship_id)
);

create index if not exists idx_certificates_user on public.certificates (user_id);

-- Enforce immutability: once issued, only `status` may ever change (for
-- revocation, which is a service-role admin action). Everything else is frozen.
create or replace function public.enforce_certificate_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.fellowship_id is distinct from old.fellowship_id
     or new.recipient_name is distinct from old.recipient_name
     or new.fellowship_title is distinct from old.fellowship_title
     or new.issued_at is distinct from old.issued_at then
    raise exception 'certificate core fields are immutable once issued';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_certificates_immutable on public.certificates;
create trigger trg_certificates_immutable
  before update on public.certificates
  for each row execute function public.enforce_certificate_immutable();

-- Public verification view: exposes ONLY the safe, public columns. The verify
-- page and QR link resolve against this. UUID ids make enumeration impractical.
create or replace view public.certificate_verifications as
  select id, recipient_name, fellowship_title, issued_at, status
  from public.certificates;

grant select on public.certificate_verifications to anon, authenticated;

-- ----------------------------------------------------------------------------
-- spotlight_profiles — OPT-IN LinkedIn/feature consent + assets.
-- Nothing here is required to complete a fellowship or earn a certificate.
-- ----------------------------------------------------------------------------
create table if not exists public.spotlight_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users (id) on delete cascade,
  display_name         text,
  headline             text,
  short_bio            text,
  city                 text,
  country              text,
  working_on           text,
  quote                text,
  photo_path           text,
  consent_status       text not null default 'none'
                         check (consent_status in ('none', 'granted', 'withdrawn')),
  consent_scope        text,
  consent_granted_at   timestamptz,
  consent_withdrawn_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_spotlight_consent on public.spotlight_profiles (consent_status);

drop trigger if exists trg_spotlight_updated_at on public.spotlight_profiles;
create trigger trg_spotlight_updated_at
  before update on public.spotlight_profiles
  for each row execute function public.set_updated_at();
