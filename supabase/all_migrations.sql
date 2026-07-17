-- ==========================================================================
-- Heal Digital Impact Internships — ALL migrations, combined in run order.
-- Paste this whole file into the Supabase SQL Editor and click Run once.
-- Safe to re-run (idempotent). Includes the optional seed at the end.
-- Source of truth is supabase/migrations/*.sql — regenerate, don't hand-edit.
-- ==========================================================================


-- ###########################################################################
-- ## 0001_schema.sql
-- ###########################################################################

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

-- ###########################################################################
-- ## 0002_rls.sql
-- ###########################################################################

-- ============================================================================
-- Heal Digital Fellowships — Row-Level Security
-- Migration 0002: enable RLS and define policies for every table.
--
-- Security model summary:
--   * Students see ONLY their own profile, enrollments, progress, certificates,
--     and spotlight row.
--   * Integrity-critical writes (seat-code redemption, progress, certificate
--     issuance) have NO client write policy — they happen ONLY server-side via
--     the service role, after server validation. RLS therefore makes it
--     impossible for a browser to forge completion or mint a certificate.
--   * Admins (profiles.role = 'admin') manage partners, codes, and content.
--   * Certificate verification is public read-only, via a column-limited view.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Users may update their own profile. The enforce_profile_role trigger
-- prevents changing `role` unless the caller is already an admin.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- partners — admin only.
-- ---------------------------------------------------------------------------
alter table public.partners enable row level security;

drop policy if exists partners_admin_all on public.partners;
create policy partners_admin_all on public.partners
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- fellowships — readable when published (or enrolled, or admin); admin writes.
-- ---------------------------------------------------------------------------
alter table public.fellowships enable row level security;

drop policy if exists fellowships_select on public.fellowships;
create policy fellowships_select on public.fellowships
  for select to authenticated
  using (
    is_published
    or public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.fellowship_id = fellowships.id
    )
  );

drop policy if exists fellowships_admin_write on public.fellowships;
create policy fellowships_admin_write on public.fellowships
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- modules — readable by enrolled users (or admin); admin writes.
-- ---------------------------------------------------------------------------
alter table public.modules enable row level security;

drop policy if exists modules_select_enrolled on public.modules;
create policy modules_select_enrolled on public.modules
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.fellowship_id = modules.fellowship_id
    )
  );

drop policy if exists modules_admin_write on public.modules;
create policy modules_admin_write on public.modules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- enrollment_codes — admin only. Students never read codes directly (prevents
-- enumeration); redemption is performed server-side with the service role.
-- ---------------------------------------------------------------------------
alter table public.enrollment_codes enable row level security;

drop policy if exists codes_admin_all on public.enrollment_codes;
create policy codes_admin_all on public.enrollment_codes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- enrollments — students read their own; admins read all.
-- Inserts happen ONLY server-side (redemption) via the service role.
-- ---------------------------------------------------------------------------
alter table public.enrollments enable row level security;

drop policy if exists enrollments_select_own_or_admin on public.enrollments;
create policy enrollments_select_own_or_admin on public.enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists enrollments_admin_write on public.enrollments;
create policy enrollments_admin_write on public.enrollments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- progress — students read their own; admins read all.
-- NO client INSERT/UPDATE/DELETE policy: progress is written ONLY by the
-- server after validation. This is the core certificate-integrity control.
-- ---------------------------------------------------------------------------
alter table public.progress enable row level security;

drop policy if exists progress_select_own_or_admin on public.progress;
create policy progress_select_own_or_admin on public.progress
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- certificates — students read their own full row; admins read all.
-- Public verification uses the certificate_verifications view (column-limited).
-- NO client write policy: issuance + revocation are server-side only.
-- The enforce_certificate_immutable trigger freezes core fields forever.
-- ---------------------------------------------------------------------------
alter table public.certificates enable row level security;

drop policy if exists certificates_select_own_or_admin on public.certificates;
create policy certificates_select_own_or_admin on public.certificates
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- spotlight_profiles — students manage their own; admins see ONLY consenting
-- students (consent_status = 'granted'). Admins cannot see non-consenting rows.
-- ---------------------------------------------------------------------------
alter table public.spotlight_profiles enable row level security;

drop policy if exists spotlight_select_own on public.spotlight_profiles;
create policy spotlight_select_own on public.spotlight_profiles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists spotlight_select_admin_granted on public.spotlight_profiles;
create policy spotlight_select_admin_granted on public.spotlight_profiles
  for select to authenticated
  using (public.is_admin() and consent_status = 'granted');

drop policy if exists spotlight_insert_own on public.spotlight_profiles;
create policy spotlight_insert_own on public.spotlight_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists spotlight_update_own on public.spotlight_profiles;
create policy spotlight_update_own on public.spotlight_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists spotlight_delete_own on public.spotlight_profiles;
create policy spotlight_delete_own on public.spotlight_profiles
  for delete to authenticated
  using (user_id = auth.uid());

-- ###########################################################################
-- ## 0003_storage.sql
-- ###########################################################################

-- ============================================================================
-- Heal Digital Fellowships — Storage
-- Migration 0003: private spotlight-photos bucket + RLS on storage.objects.
--
-- Layout: each user's photo lives under a folder named by their user id:
--   spotlight-photos/{auth.uid}/<filename>
-- so the first path segment identifies the owner.
--
-- Access rules:
--   * A student can upload / replace / delete ONLY their own photo.
--   * A student can read their own photo.
--   * An admin can read a photo ONLY if that student's spotlight consent is
--     'granted'. Admins cannot read photos of non-consenting students.
-- ============================================================================

-- Private bucket with server-side file type + size limits (belt and braces;
-- the upload route validates too). 5 MB max, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spotlight-photos',
  'spotlight-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- INSERT: only into your own {uid}/ folder.
drop policy if exists spotlight_photo_insert_own on storage.objects;
create policy spotlight_photo_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'spotlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE (replace): only your own folder.
drop policy if exists spotlight_photo_update_own on storage.objects;
create policy spotlight_photo_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'spotlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'spotlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: only your own folder (student's "delete my photo" hard-delete).
drop policy if exists spotlight_photo_delete_own on storage.objects;
create policy spotlight_photo_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'spotlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: your own photo, OR an admin reading a CONSENTING student's photo.
drop policy if exists spotlight_photo_select_own on storage.objects;
create policy spotlight_photo_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'spotlight-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists spotlight_photo_select_admin_granted on storage.objects;
create policy spotlight_photo_select_admin_granted on storage.objects
  for select to authenticated
  using (
    bucket_id = 'spotlight-photos'
    and public.is_admin()
    and exists (
      select 1 from public.spotlight_profiles sp
      where sp.user_id::text = (storage.foldername(name))[1]
        and sp.consent_status = 'granted'
    )
  );

-- ###########################################################################
-- ## 0005_redeem_function.sql
-- ###########################################################################

-- ============================================================================
-- Heal Digital Fellowships — Seat-code redemption
-- Migration 0005: atomic, race-safe redemption as a SECURITY DEFINER RPC.
--
-- Why an RPC instead of client-side writes?
--   * Redemption touches three rows (code, enrollment, partner seat count) and
--     must be all-or-nothing. A single function call runs in one transaction.
--   * Row locks (FOR UPDATE) prevent two users racing to redeem the same code
--     or overrunning a partner's seat allowance.
--   * enrollment_codes has NO client-side write policy, so this is the ONLY
--     way a student can redeem — they can never flip a code's status directly.
--   * SECURITY DEFINER lets it write those rows while still reading the real
--     caller via auth.uid() (taken from the request JWT, not a parameter).
-- ============================================================================

create or replace function public.redeem_enrollment_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_code     public.enrollment_codes%rowtype;
  v_partner  public.partners%rowtype;
  v_existing uuid;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Normalise and lock the code row.
  select * into v_code
  from public.enrollment_codes
  where upper(code) = upper(btrim(p_code))
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_code.status = 'revoked' then
    return jsonb_build_object('ok', false, 'error', 'code_revoked');
  end if;

  if v_code.status = 'redeemed' then
    if v_code.redeemed_by = v_user then
      -- Idempotent: this user already redeemed this exact code.
      return jsonb_build_object('ok', true, 'fellowship_id', v_code.fellowship_id,
                               'already', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'code_used');
  end if;

  -- Already enrolled in this fellowship (via another code)?
  select id into v_existing
  from public.enrollments
  where user_id = v_user and fellowship_id = v_code.fellowship_id;

  if v_existing is not null then
    return jsonb_build_object('ok', false, 'error', 'already_enrolled',
                             'fellowship_id', v_code.fellowship_id);
  end if;

  -- Lock the partner row and enforce the seat allowance.
  select * into v_partner
  from public.partners
  where id = v_code.partner_id
  for update;

  if v_partner.seats_used >= v_partner.seats_purchased then
    return jsonb_build_object('ok', false, 'error', 'no_seats');
  end if;

  update public.enrollment_codes
     set status = 'redeemed', redeemed_by = v_user, redeemed_at = now()
   where id = v_code.id;

  insert into public.enrollments (user_id, fellowship_id, enrollment_code_id)
  values (v_user, v_code.fellowship_id, v_code.id);

  update public.partners
     set seats_used = seats_used + 1
   where id = v_partner.id;

  return jsonb_build_object('ok', true, 'fellowship_id', v_code.fellowship_id);
end;
$$;

revoke all on function public.redeem_enrollment_code(text) from public, anon;
grant execute on function public.redeem_enrollment_code(text) to authenticated;

-- ###########################################################################
-- ## 0006_sdgs.sql
-- ###########################################################################

-- ============================================================================
-- Heal Digital Impact Internships — SDG mapping
-- Migration 0006: tag each module with the UN Sustainable Development Goals it
-- covers, so students can see which SDGs they are progressing through.
-- ============================================================================

alter table public.modules
  add column if not exists sdgs smallint[] not null default '{}';

comment on column public.modules.sdgs is
  'UN SDG numbers (1-17) this module covers, e.g. {3,6,11}.';

-- ###########################################################################
-- ## 0004_seed.sql
-- ###########################################################################

-- ============================================================================
-- Heal Digital Impact Internships — Seed (OPTIONAL, for local dev / first run)
-- Migration 0004: one example internship with the four shipped simulations,
-- each mapped to the UN SDGs it covers.
--
-- Requires 0006_sdgs.sql to have run first (adds the modules.sdgs column).
-- Safe to run more than once (idempotent on slug / order_index).
-- ============================================================================

insert into public.fellowships (slug, title, description, locale, cover_color, is_published)
values (
  'ai-governance',
  'Applied AI Impact Internship',
  'Work through real-world impact simulations mapped to the UN Sustainable Development Goals — water intelligence, public health, urban safety, and the future of work — then apply what you learn. Earn a verifiable Impact Certification.',
  'en',
  '#0f8b80',
  true
)
on conflict (slug) do nothing;

-- Simulation modules (all engagement-based dashboards/simulations).
insert into public.modules
  (fellowship_id, title, description, type, order_index, asset_path, completion_rule, completion_config, is_required, sdgs)
select f.id, m.title, m.description, m.type, m.order_index, m.asset_path,
       m.completion_rule, m.completion_config::jsonb, m.is_required, m.sdgs
from public.fellowships f
cross join (values
  (
    'Karachi Water Intelligence',
    'An interactive water-quality intelligence dashboard. Explore the data, then mark complete to continue.',
    'explore', 0, 'karachi-water-intelligence.html', 'engagement',
    '{"min_seconds": 45}', true, array[6,11,3]::smallint[]
  ),
  (
    'Health Research Platform — Shaoor aur Shifa',
    'Explore a public-health research platform spanning maternal health, nutrition, and communicable diseases.',
    'explore', 1, 'health-research-platform.html', 'engagement',
    '{"min_seconds": 45}', true, array[3]::smallint[]
  ),
  (
    'Mahfooz Karachi — Safety Observatory',
    'A city safety observatory. Explore the indicators and what drives them.',
    'explore', 2, 'karachi-safety-observatory.html', 'engagement',
    '{"min_seconds": 45}', true, array[11,16,3]::smallint[]
  ),
  (
    'Rozgar — Karachi 2041',
    'A 3D simulation of jobs and economic futures for the city. Explore the scenarios.',
    'explore', 3, 'rozgar-karachi-2041.html', 'engagement',
    '{"min_seconds": 45}', true, array[8,9,11]::smallint[]
  )
) as m(title, description, type, order_index, asset_path, completion_rule, completion_config, is_required, sdgs)
where f.slug = 'ai-governance'
on conflict (fellowship_id, order_index) do nothing;
