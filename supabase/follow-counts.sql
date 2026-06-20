-- ============================================================================
-- MIGRATION: follow-count sync trigger
-- ----------------------------------------------------------------------------
-- Required for the new "follow your friends" feature. RLS only lets a user
-- update their OWN users row, so follower_count / following_count must be
-- maintained server-side whenever rows are added/removed from public.follows.
--
-- Run once: Supabase Dashboard → SQL Editor → paste → Run. Safe & idempotent.
-- (Already included in supabase/schema.sql for fresh setups.)
-- ============================================================================

create or replace function public.sync_follow_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.users set following_count = following_count + 1 where id = new.follower_id;
    update public.users set follower_count  = follower_count  + 1 where id = new.following_id;
  elsif (tg_op = 'DELETE') then
    update public.users set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.users set follower_count  = greatest(follower_count  - 1, 0) where id = old.following_id;
  end if;
  return null;
end $$;

drop trigger if exists on_follow_change on public.follows;
create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function public.sync_follow_counts();
