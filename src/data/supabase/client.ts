import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when both client env vars are present (URL + anon key). */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Shared browser client. The anon key is public-safe — RLS (see supabase/schema.sql)
 * is what actually protects the data. Falls back to harmless placeholders when
 * unconfigured so importing this module never throws; the repositoryProvider only
 * routes to Supabase repos when {@link isSupabaseConfigured} is true.
 */
export const supabase = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

/** Current authenticated user id (text), or null when signed out. */
export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}
