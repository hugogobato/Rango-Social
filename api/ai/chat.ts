/* eslint-disable @typescript-eslint/no-explicit-any */
import { userClient } from '../_lib/supabase'
import { loadTasteDigest } from '../_lib/tasteContext'
import { chatSystemPrompt } from '../_lib/persona'
import { generateText, type ChatTurn } from '../_lib/gemma'
import { isWithinRateLimit } from '../_lib/rateLimit'

const HISTORY_LIMIT = 12
const MESSAGE_MAX = 1000
const GENERIC_FALLBACK = 'Eita, deu um nó na minha cabeça aqui 🤯 tenta de novo daqui a pouco!'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * POST /api/ai/chat  — the JWT-authed AI agent endpoint.
 *
 * 1. Verifies the Supabase access token (Authorization: Bearer …).
 * 2. Rate-limits per user.
 * 3. Persists the user's message, loads their taste context + recent history.
 * 4. Calls Gemma and persists + returns the assistant reply.
 *
 * All Supabase access goes through a user-scoped (RLS-enforced) client, so the
 * endpoint can only ever read/write the caller's own rows.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return json({ error: 'unauthorized' }, 401)

  let message: string
  try {
    const body = (await req.json()) as { message?: unknown }
    message = typeof body.message === 'string' ? body.message.trim() : ''
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }
  if (!message) return json({ error: 'empty_message' }, 400)
  if (message.length > MESSAGE_MAX) message = message.slice(0, MESSAGE_MAX)

  const supabase = userClient(token)
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (userErr || !userId) return json({ error: 'unauthorized' }, 401)

  if (!(await isWithinRateLimit(supabase, userId))) {
    return json({ error: 'rate_limited' }, 429)
  }

  // Persist the user's message first (RLS: own rows only).
  const { error: userInsertErr } = await supabase
    .from('ai_chat_messages')
    .insert({ user_id: userId, role: 'user', content: message })
  if (userInsertErr) return json({ error: 'persist_failed', detail: userInsertErr.message }, 500)

  // Load taste context + recent conversation (now including the message above).
  const [{ digest }, historyRes] = await Promise.all([
    loadTasteDigest(supabase, userId),
    supabase
      .from('ai_chat_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT),
  ])

  const turns: ChatTurn[] = (historyRes.data ?? [])
    .slice()
    .reverse()
    .map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content }))

  let reply = GENERIC_FALLBACK
  try {
    reply = await generateText({ system: chatSystemPrompt(digest), turns })
  } catch (e) {
    console.error('[ai/chat] generation failed:', (e as Error).message)
  }

  const { error: assistantInsertErr } = await supabase
    .from('ai_chat_messages')
    .insert({ user_id: userId, role: 'assistant', content: reply })
  if (assistantInsertErr) {
    return json({ error: 'persist_failed', detail: assistantInsertErr.message }, 500)
  }

  return json({ reply })
}
