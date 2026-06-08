import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from './env'

/**
 * A Supabase client acting AS the signed-in user. It carries the caller's access
 * token, so every query is still subject to RLS — the endpoint can only read the
 * user's own data (own reviews, own liked reviews, own profile, own chat).
 */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * A privileged client that BYPASSES RLS. Use only for the weekly cron, which
 * needs to read many users' taste data to regenerate their profiles. Never
 * expose this path to user-driven input.
 */
export function serviceClient(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
