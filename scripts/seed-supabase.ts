/**
 * OPTIONAL demo seeder — loads the in-memory mock fixtures (fake influencers,
 * reviews, restaurants, groups, lists, etc.) into a Supabase project.
 *
 * By default this does NOTHING: the app ships as a blank slate so real users
 * create their own content. Pass SEED_DEMO=1 to load the demo fixtures:
 *
 *   SEED_DEMO=1 npm run seed     (or: SEED_DEMO=1 npx tsx scripts/seed-supabase.ts)
 *
 * Reads VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local. The
 * service_role key bypasses RLS, so this runs server-side ONLY — never ship it
 * to the browser. Idempotent: every table is upserted on its primary key, so
 * re-running overwrites rather than duplicates.
 *
 * Not seeded: stories / illness_reports / duels / elos / ai_* — these aren't in
 * the fixtures and are created at runtime once you're signed in. review_likes is
 * intentionally skipped too: inserting it would fire the like-sync trigger and
 * inflate the curated fixture like counts.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import {
  allUsers,
  restaurants,
  reviews,
  comments,
  groups,
  lists,
  vibeChecks,
  notifications,
  currentUser,
} from '../src/data/mock/fixtures'
import { userToRow, restaurantToRow } from '../src/data/supabase/mappers'
import type {
  Review,
  Comment,
  Group,
  CustomList,
  VibeCheck,
  Notification,
} from '../src/domain/models'

// ---------------------------------------------------------------------------
// .env.local loader (no extra deps)
// ---------------------------------------------------------------------------
function loadEnv(): Record<string, string> {
  const path = resolve(process.cwd(), '.env.local')
  let txt = ''
  try {
    txt = readFileSync(path, 'utf8')
  } catch {
    console.error('✖ Could not read .env.local at', path)
    process.exit(1)
  }
  const env: Record<string, string> = {}
  for (const raw of txt.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    '✖ Missing VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ---------------------------------------------------------------------------
// Row builders (camelCase model → snake_case row), preserving fixture ids/counts
// ---------------------------------------------------------------------------
const reviewRow = (r: Review) => ({
  id: r.id,
  user_id: r.userId,
  restaurant_id: r.restaurantId,
  overall_score: r.overallScore,
  metrics: r.metrics,
  comment: r.comment,
  photos: r.photos,
  target_destinations: r.targetDestinations,
  receipt_photo: r.receiptPhoto,
  total_spent: r.totalSpent ?? null,
  party_size: r.partySize ?? null,
  visit_date: r.visitDate,
  companions: r.companions,
  likes: r.likes,
  created_at: r.createdAt,
})

const commentRow = (c: Comment) => ({
  id: c.id,
  review_id: c.reviewId,
  user_id: c.userId,
  text: c.text,
  parent_id: c.parentId ?? null,
  likes: c.likes,
  created_at: c.createdAt,
})

const groupRow = (g: Group) => ({
  id: g.id,
  name: g.name,
  description: g.description ?? null,
  cover_url: g.coverUrl ?? null,
  admin_id: g.adminId,
  admins: g.admins,
  is_open: g.isOpen,
  mandatory_metrics: g.mandatoryMetrics,
  created_at: g.createdAt,
})

const groupMemberRows = (g: Group) =>
  g.members.map((m) => ({
    group_id: g.id,
    user_id: m.userId,
    role: m.role,
    joined_at: m.joinedAt,
  }))

const listRow = (l: CustomList) => ({
  id: l.id,
  owner_id: l.ownerId,
  name: l.name,
  description: l.description ?? null,
  icon_url: l.iconUrl ?? null,
  cover_color: l.coverColor ?? null,
  is_public: l.isPublic,
  is_wishlist: l.isWishlist,
  collaborators: l.collaborators,
  shared_with: l.sharedWith,
  themes: l.themes,
  follower_count: l.followerCount,
  created_at: l.createdAt,
  updated_at: l.updatedAt,
})

const listItemRows = (l: CustomList) =>
  l.restaurants.map((it) => ({
    list_id: l.id,
    restaurant_id: it.restaurantId,
    added_by: it.addedBy,
    note: it.note ?? null,
    priority: it.priority,
    added_at: it.addedAt,
  }))

const vibeRow = (v: VibeCheck) => ({
  id: v.id,
  user_id: v.userId,
  restaurant_id: v.restaurantId,
  status: v.status,
  note: v.note ?? null,
  photo: v.photo ?? null,
  expires_at: v.expiresAt,
  created_at: v.createdAt,
})

const notificationRow = (n: Notification) => ({
  id: n.id,
  user_id: currentUser.id, // recipient — fixtures target the current user
  type: n.type,
  actor_id: n.actor?.id ?? null,
  target_review_id: n.targetReview?.id ?? null,
  target_restaurant_id: n.targetRestaurant?.id ?? null,
  target_group_id: n.targetGroup?.id ?? null,
  target_list_id: n.targetList?.id ?? null,
  message: n.message,
  is_read: n.isRead,
  created_at: n.createdAt,
})

// ---------------------------------------------------------------------------
// Upsert helper
// ---------------------------------------------------------------------------
async function upsert(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
) {
  if (rows.length === 0) {
    console.log(`  • ${table}: nothing to seed`)
    return
  }
  const { error } = await supabase.from(table).upsert(rows, { onConflict })
  if (error) {
    console.error(`✖ ${table}: ${error.message}`)
    process.exit(1)
  }
  console.log(`  ✓ ${table}: ${rows.length} rows`)
}

// ---------------------------------------------------------------------------
// Run (FK-respecting order)
// ---------------------------------------------------------------------------
async function main() {
  if (env.SEED_DEMO !== '1' && process.env.SEED_DEMO !== '1') {
    console.log(
      'Skipping demo seed (blank-slate default).\n' +
        'To load the fake demo fixtures anyway, run: SEED_DEMO=1 npm run seed'
    )
    return
  }

  console.log(`Seeding DEMO fixtures into ${url} …`)

  await upsert('users', allUsers.map(userToRow), 'id')
  await upsert('restaurants', restaurants.map(restaurantToRow), 'id')
  await upsert('reviews', reviews.map(reviewRow), 'id')
  await upsert('comments', comments.map(commentRow), 'id')
  await upsert('groups', groups.map(groupRow), 'id')
  await upsert(
    'group_members',
    groups.flatMap(groupMemberRows),
    'group_id,user_id'
  )
  await upsert('custom_lists', lists.map(listRow), 'id')
  await upsert(
    'list_items',
    lists.flatMap(listItemRows),
    'list_id,restaurant_id'
  )
  await upsert('vibe_checks', vibeChecks.map(vibeRow), 'id')
  await upsert('notifications', notifications.map(notificationRow), 'id')

  console.log('Done. ✅')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
