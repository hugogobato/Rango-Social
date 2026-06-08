/**
 * Server-only environment access for the `/api` functions.
 *
 * This module is NEVER imported by the client bundle — it reads secrets
 * (`SUPABASE_SERVICE_ROLE_KEY`, `GEMMA_API_KEY`) that must stay server-side.
 * The Supabase URL/anon key are reused from the `VITE_`-prefixed vars when no
 * unprefixed copy is set, so you don't have to duplicate them in Vercel.
 */

/** Returns the first env var that is set among `names`, or throws. */
export function requireEnv(names: string | string[]): string {
  const list = Array.isArray(names) ? names : [names]
  for (const name of list) {
    const value = process.env[name]
    if (value) return value
  }
  throw new Error(`Missing required env var: ${list.join(' | ')}`)
}

/** Returns the env var if set, otherwise `fallback`. */
export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

export const supabaseUrl = () => requireEnv(['SUPABASE_URL', 'VITE_SUPABASE_URL'])
export const supabaseAnonKey = () => requireEnv(['SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'])
export const supabaseServiceKey = () => requireEnv('SUPABASE_SERVICE_ROLE_KEY')
