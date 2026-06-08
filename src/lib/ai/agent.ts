import { isSupabaseConfigured, supabase } from '../../data/supabase/client'
import { db } from '../../data/repositoryProvider'

/** Thrown when the endpoint rate-limits the user (HTTP 429). */
export const RATE_LIMITED = 'RATE_LIMITED'

/** Thrown in Supabase mode when there's no signed-in session (chat needs auth). */
export const NOT_AUTHENTICATED = 'NOT_AUTHENTICATED'

/**
 * Offline / mock-mode reply. Used when there's no real backend (running on
 * `VITE_DATA_SOURCE=mock`, or signed out) so `npm run dev` still demos the agent
 * without a Gemma key. Mirrors the persona at a much simpler level.
 */
function localFallbackReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('pizza')) {
    return 'Pô, se a pegada é pizza, dá uma colada na *Fornazza*! A galera do seu bonde vive elogiando o custo-benefício de lá. 🍕🔥'
  }
  if (t.includes('hambúrguer') || t.includes('hamburguer') || t.includes('burger')) {
    return 'Pra hambúrguer, o *Podrão do Zé* é imbatível na larica da madrugada. Se quiser algo mais clean, a *Hamburgueria Gourmet* em Pinheiros tá nota 4.8 em sabor! 🍔✨'
  }
  return 'Com base nos reviews que você curtiu, o japonês *Sushi Garden* é uma boa pedida hoje — atendimento amassado demais (5/5)! Bora colar? 🍣👀'
}

/**
 * Sends one chat turn and returns the assistant's reply text.
 *
 * - Supabase mode: requires a signed-in session (throws {@link NOT_AUTHENTICATED}
 *   otherwise, since RLS would block any write anyway). POSTs to `/api/ai/chat`,
 *   which persists BOTH the user message and the assistant reply server-side and
 *   returns the reply.
 * - Mock / offline mode: persists locally via the repository and synthesizes a
 *   reply so the screen keeps working without a backend.
 *
 * In both cases the caller should invalidate the `['aiChatHistory', userId]`
 * query afterwards to reconcile with the source of truth.
 */
export async function sendAiTurn(userId: string, text: string): Promise<string> {
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) throw new Error(NOT_AUTHENTICATED)

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message: text }),
    })
    if (res.status === 429) throw new Error(RATE_LIMITED)
    if (res.status === 401) throw new Error(NOT_AUTHENTICATED)
    if (!res.ok) throw new Error(`AI_ERROR_${res.status}`)
    const json = (await res.json()) as { reply: string }
    return json.reply
  }

  // Mock / offline: persist both sides locally.
  await db.ai.postChatMessage(userId, 'user', text)
  const reply = localFallbackReply(text)
  await db.ai.postChatMessage(userId, 'assistant', reply)
  return reply
}
