-- ============================================================================
-- IESP — Native server-graded activities
-- Migration 0007: case studies / quizzes / matching / drag-order / math / essay.
--
-- Integrity model:
--   * `activities.spec` holds the FULL definition INCLUDING answer keys.
--     Students have NO read policy on this table, so answer keys are never
--     exposed to the browser. Grading happens server-side with the service role.
--   * `submissions` stores each student's answers + server-computed score.
--     Students read only their own; writes are server-side only.
-- ============================================================================

-- Which renderer a module uses: an embedded HTML sim, or a native activity.
alter table public.modules
  add column if not exists kind text not null default 'embed'
    check (kind in ('embed', 'activity'));

-- Activity content (answer keys live here — admin/service-role only).
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null unique references public.modules (id) on delete cascade,
  spec        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_activities_updated_at on public.activities;
create trigger trg_activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

alter table public.activities enable row level security;

-- Only admins can read/write activity specs. Students receive an
-- answer-stripped version through a server route, never direct table access.
drop policy if exists activities_admin_all on public.activities;
create policy activities_admin_all on public.activities
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Student submissions + graded results.
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  module_id     uuid not null references public.modules (id) on delete cascade,
  fellowship_id uuid not null references public.fellowships (id) on delete cascade,
  answers       jsonb not null default '{}'::jsonb,
  score         numeric(5, 2) check (score is null or (score >= 0 and score <= 100)),
  essay_text    text,
  needs_review  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, module_id)
);

create index if not exists idx_submissions_user on public.submissions (user_id);
create index if not exists idx_submissions_review on public.submissions (needs_review);

drop trigger if exists trg_submissions_updated_at on public.submissions;
create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

alter table public.submissions enable row level security;

-- Students read their own submissions; admins read all. Writes are server-side
-- only (service role) after server-side grading — no client write policy.
drop policy if exists submissions_select_own_or_admin on public.submissions;
create policy submissions_select_own_or_admin on public.submissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
