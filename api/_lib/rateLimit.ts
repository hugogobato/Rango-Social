import type { SupabaseClient } from '@supabase/supabase-js'

const WINDOW_MS = 60_000
const MAX_USER_MESSAGES_PER_WINDOW = 15

/**
 * Best-effort per-user rate limit, backed by the durable `ai_chat_messages`
 * table (so it holds across the ephemeral serverless instances). Counts the
 * caller's `user`-role messages in the last minute; returns `true` if another
 * message is allowed. Fails open on counting errors so a transient DB hiccup
 * never blocks a legitimate user.
 */
export async function isWithinRateLimit(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count, error } = await client
    .from('ai_chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', since)

  if (error) return true
  return (count ?? 0) < MAX_USER_MESSAGES_PER_WINDOW
}
