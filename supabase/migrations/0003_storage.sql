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
