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
