/* eslint-disable @typescript-eslint/no-explicit-any */
import { serviceClient } from '../_lib/supabase'
import { loadTasteDigest } from '../_lib/tasteContext'
import { profileSystemPrompt } from '../_lib/persona'
import { generateText } from '../_lib/gemma'

const ACTIVE_WINDOW_DAYS = 7

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * GET /api/ai/refresh-profiles  — weekly Vercel Cron.
 *
 * Regenerates `ai_user_profiles.markdown` for users who were active in the last
 * 7 days (posted a review or chatted). Uses the service client to read many
 * users' taste data; the cost is bounded to active users only.
 *
 * Protected by CRON_SECRET when set — Vercel Cron sends it as a Bearer token.
 */
export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)
  }

  const admin = serviceClient()
  const since = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [reviewers, chatters] = await Promise.all([
    admin.from('reviews').select('user_id').gte('created_at', since),
    admin.from('ai_chat_messages').select('user_id').gte('created_at', since),
  ])

  if (reviewers.error || chatters.error) {
    return json(
      { error: 'query_failed', detail: reviewers.error?.message ?? chatters.error?.message },
      500
    )
  }

  const activeIds = Array.from(
    new Set([...(reviewers.data ?? []), ...(chatters.data ?? [])].map((r: any) => r.user_id))
  )

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const userId of activeIds) {
    try {
      const { digest, hasData } = await loadTasteDigest(admin, userId)
      if (!hasData) {
        skipped++
        continue
      }

      const markdown = await generateText({
        system: profileSystemPrompt(digest),
        turns: [{ role: 'user', text: 'Gere meu perfil de gosto gastronômico agora.' }],
        temperature: 0.6,
        maxOutputTokens: 700,
      })

      const { data: existing } = await admin
        .from('ai_user_profiles')
        .select('version')
        .eq('user_id', userId)
        .maybeSingle()

      const { error } = await admin.from('ai_user_profiles').upsert(
        {
          user_id: userId,
          markdown,
          version: ((existing as any)?.version ?? 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      if (error) {
        failed++
        continue
      }
      updated++
    } catch (e) {
      console.error(`[ai/refresh-profiles] failed for ${userId}:`, (e as Error).message)
      failed++
    }
  }

  return json({ ok: true, active: activeIds.length, updated, skipped, failed })
}
