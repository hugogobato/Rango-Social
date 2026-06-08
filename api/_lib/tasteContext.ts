/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'

const OWN_LIMIT = 25
const LIKED_LIMIT = 25
const COMMENT_MAX = 160

function restaurantLabel(r: any): string {
  if (!r) return 'um lugar'
  const cats = Array.isArray(r.categories) && r.categories.length ? ` [${r.categories.join(', ')}]` : ''
  const price = r.price_range ? ` ${r.price_range}` : ''
  return `${r.name}${cats}${price}`
}

function trim(comment: unknown): string {
  if (typeof comment !== 'string' || !comment.trim()) return ''
  const c = comment.trim()
  return c.length > COMMENT_MAX ? `${c.slice(0, COMMENT_MAX)}…` : c
}

/**
 * Builds a compact, text-only digest of a user's taste from their own reviews,
 * the reviews they've liked, and their existing AI profile. This is the ONLY
 * material the model is allowed to recommend from.
 *
 * Works with either a user-scoped client (RLS) or the service client (cron).
 */
export async function loadTasteDigest(
  client: SupabaseClient,
  userId: string
): Promise<{ digest: string; hasData: boolean }> {
  const [ownRes, likedRes, profileRes] = await Promise.all([
    client
      .from('reviews')
      .select('overall_score, comment, restaurant:restaurants(name, categories, price_range)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(OWN_LIMIT),
    client
      .from('review_likes')
      .select('review:reviews(overall_score, comment, restaurant:restaurants(name, categories, price_range))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(LIKED_LIMIT),
    client.from('ai_user_profiles').select('markdown').eq('user_id', userId).maybeSingle(),
  ])

  const ownLines: string[] = (ownRes.data ?? []).map((row: any) => {
    const score = row.overall_score != null ? `nota ${row.overall_score}/10` : 'sem nota'
    const note = trim(row.comment)
    return `- ${restaurantLabel(row.restaurant)} — ${score}${note ? ` — "${note}"` : ''}`
  })

  const likedLines: string[] = (likedRes.data ?? [])
    .map((row: any) => row.review)
    .filter(Boolean)
    .map((review: any) => {
      const score = review.overall_score != null ? `nota ${review.overall_score}/10` : 'sem nota'
      const note = trim(review.comment)
      return `- ${restaurantLabel(review.restaurant)} — ${score}${note ? ` — "${note}"` : ''}`
    })

  const profileMd = (profileRes.data as any)?.markdown?.trim() || ''

  const sections: string[] = []
  if (ownLines.length) {
    sections.push(`Reviews que o usuário FEZ:\n${ownLines.join('\n')}`)
  }
  if (likedLines.length) {
    sections.push(`Reviews que o usuário CURTIU:\n${likedLines.join('\n')}`)
  }
  if (profileMd) {
    sections.push(`Perfil de gosto já conhecido:\n${profileMd}`)
  }

  const hasData = ownLines.length > 0 || likedLines.length > 0
  const digest = sections.length
    ? sections.join('\n\n')
    : 'O usuário ainda não fez nem curtiu nenhum review.'

  return { digest, hasData }
}
