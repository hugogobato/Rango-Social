import { optionalEnv, requireEnv } from './env'

export interface ChatTurn {
  role: 'user' | 'model'
  text: string
}

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

interface GenerateOptions {
  system: string
  turns: ChatTurn[]
  temperature?: number
  maxOutputTokens?: number
}

/**
 * Calls Google's Generative Language API with the configured Gemma model.
 *
 * Gemma models don't accept a separate `system_instruction`, so the persona +
 * user-taste context is folded into the first user turn. The API also requires
 * the conversation to start with a `user` turn, which we guarantee here.
 */
export async function generateText(opts: GenerateOptions): Promise<string> {
  const apiKey = requireEnv('GEMMA_API_KEY')
  const model = optionalEnv('GEMMA_MODEL', 'gemma-4-26b-a4b-it')

  const turns: ChatTurn[] = opts.turns.length
    ? opts.turns
    : [{ role: 'user', text: 'Oi!' }]

  const contents = turns.map((t, i) =>
    i === 0 && t.role === 'user'
      ? { role: 'user', parts: [{ text: `${opts.system}\n\n---\n\n${t.text}` }] }
      : { role: t.role, parts: [{ text: t.text }] }
  )

  // If the window happens to start with a model turn, prepend the persona as its
  // own user turn so the request still begins with `user`.
  if (turns[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: opts.system }] })
  }

  const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.85,
        maxOutputTokens: opts.maxOutputTokens ?? 600,
        topP: 0.95,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemma API ${res.status}: ${detail.slice(0, 500)}`)
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
    promptFeedback?: { blockReason?: string }
  }

  if (json.promptFeedback?.blockReason) {
    throw new Error(`Gemma blocked the prompt: ${json.promptFeedback.blockReason}`)
  }

  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim()

  if (!text) throw new Error('Gemma returned no text')
  return text
}
