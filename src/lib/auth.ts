import { supabase } from '../data/supabase/client'

export interface SignUpInput {
  email: string
  password: string
  username: string
  displayName: string
  cpf?: string
  cpfValid?: boolean
}

/**
 * Email/password sign-up. The profile row (incl. CPF) is created by the
 * `handle_new_user` trigger from this metadata — see supabase/schema.sql.
 */
export async function signUpWithEmail(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        username: input.username,
        display_name: input.displayName,
        cpf: input.cpf ?? null,
        cpf_valid: input.cpfValid ?? null,
      },
    },
  })
  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Subscribe to auth changes; returns an unsubscribe fn. */
export function onAuthChange(cb: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(() => cb())
  return () => data.subscription.unsubscribe()
}
