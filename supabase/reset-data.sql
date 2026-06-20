-- ============================================================================
-- BLANK-SLATE RESET  ⚠️ DESTRUCTIVE
-- ----------------------------------------------------------------------------
-- Wipes ALL seeded/demo content (fake reviews, photos, badges, groups, lists,
-- vibe checks, notifications, stories, duels, and the fake influencer accounts)
-- so you and your friends start from zero. Keeps the schema + triggers and the
-- login + profile of REAL authenticated users (anyone in auth.users).
--
-- How to run: Supabase Dashboard → SQL Editor → paste this whole file → Run.
-- This runs as the service role and bypasses RLS.
--
-- After running, re-deploy / refresh the app: the catalog is empty, so add a
-- restaurant via the review flow's "Lugar novo" form before reviewing it.
-- ============================================================================

begin;

-- Child / dependent tables first (most have ON DELETE CASCADE, but explicit is safe).
delete from public.ai_chat_messages;
delete from public.ai_user_profiles;
delete from public.cuisine_elos;
delete from public.restaurant_duels;
delete from public.illness_reports;
delete from public.stories;
delete from public.notifications;
delete from public.list_items;
delete from public.custom_lists;
delete from public.group_members;
delete from public.groups;
delete from public.comments;
delete from public.review_likes;
delete from public.reviews;
delete from public.vibe_checks;
delete from public.follows;

-- Blank slate: wipe the restaurant catalog too (you'll re-add places yourself).
delete from public.restaurants;

-- Remove seeded fake users, but KEEP real accounts that can actually log in.
delete from public.users
where id not in (select id::text from auth.users);

-- Reset any stats/badges left on real profiles so nobody starts "pre-loaded".
update public.users set
  follower_count  = 0,
  following_count = 0,
  review_count    = 0,
  badges          = '[]'::jsonb,
  current_streak  = 0,
  longest_streak  = 0,
  is_verified     = false,
  influencer_tier = null;

commit;
