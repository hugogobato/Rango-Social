/* eslint-disable @typescript-eslint/no-explicit-any */
import { serviceClient } from '../_lib/supabase'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const STORY_BUCKET = 'story-photos'

/**
 * Pull the storage object path out of a public story URL so the photo can be
 * deleted alongside its DB row. Returns null for external URLs (e.g. mock
 * picsum links), which we simply leave alone.
 */
function storyObjectPath(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null
  const marker = `/storage/v1/object/public/${STORY_BUCKET}/`
  const idx = photoUrl.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(photoUrl.slice(idx + marker.length))
}

/**
 * GET /api/cron/cleanup-expired — hourly Vercel Cron.
 *
 * Hard-deletes expired ephemeral content so the tables (and Storage) don't grow
 * unbounded: Stories live 24h, Vibe Checks 4h. Reads are already filtered by
 * `expires_at > now()`, so this is purely a storage/cost cleanup — nothing the
 * user can see disappears earlier than it should.
 *
 * Protected by CRON_SECRET when set (Vercel Cron sends it as a Bearer token).
 */
export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)
  }

  const admin = serviceClient()
  const now = new Date().toISOString()

  // 1. Remove the storage objects backing expired stories (best effort).
  let photosRemoved = 0
  const { data: expiredStories } = await admin
    .from('stories')
    .select('id, photo_url')
    .lt('expires_at', now)

  const paths = (expiredStories ?? [])
    .map((s: any) => storyObjectPath(s.photo_url))
    .filter((p: string | null): p is string => !!p)

  if (paths.length > 0) {
    const { error } = await admin.storage.from(STORY_BUCKET).remove(paths)
    if (!error) photosRemoved = paths.length
  }

  // 2. Delete the expired rows.
  const stories = await admin.from('stories').delete().lt('expires_at', now).select('id')
  const vibeChecks = await admin
    .from('vibe_checks')
    .delete()
    .lt('expires_at', now)
    .select('id')

  if (stories.error || vibeChecks.error) {
    return json(
      {
        error: 'cleanup_failed',
        detail: stories.error?.message ?? vibeChecks.error?.message,
      },
      500
    )
  }

  return json({
    ok: true,
    storiesDeleted: stories.data?.length ?? 0,
    vibeChecksDeleted: vibeChecks.data?.length ?? 0,
    photosRemoved,
  })
}
