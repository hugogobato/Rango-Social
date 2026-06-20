-- ============================================================================
-- MIGRATION: Storage bucket for photos (reviews, stories, avatars)
-- ----------------------------------------------------------------------------
-- Creates a single public 'media' bucket and the RLS policies on
-- storage.objects so signed-in users can upload and everyone can read.
--
-- Run once: Supabase Dashboard → SQL Editor → paste → Run. Idempotent.
-- (You can also create the bucket manually under Storage → New bucket → public.)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Anyone may read objects in the public bucket.
drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects
  for select using (bucket_id = 'media');

-- Only authenticated users may upload / overwrite / delete.
drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects
  for update to authenticated using (bucket_id = 'media');

drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media');
