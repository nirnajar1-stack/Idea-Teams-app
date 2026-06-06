import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'

export interface CloudLoginResult {
  ok: boolean
  userId?: string
  email?: string
  error?: 'empty_password' | 'ambiguous' | 'invalid' | 'network'
}

export async function loginWithPasswordCloud(password: string): Promise<CloudLoginResult> {
  if (!isSupabaseEnabled()) {
    return { ok: false, error: 'network' }
  }
  const { data, error } = await getSupabase().rpc('login_with_password', {
    p_password: password,
  })
  if (error) {
    console.warn('login_with_password RPC failed', error.message)
    return { ok: false, error: 'network' }
  }
  const result = data as { ok: boolean; userId?: string; email?: string; error?: string }
  if (!result.ok) {
    return {
      ok: false,
      error: (result.error as CloudLoginResult['error']) ?? 'invalid',
    }
  }
  return { ok: true, userId: result.userId, email: result.email }
}

export async function signInSupabaseAuth(email: string, password: string): Promise<boolean> {
  if (!isSupabaseEnabled()) return false
  const { error } = await getSupabase().auth.signInWithPassword({ email, password })
  if (error) {
    console.warn('Supabase Auth signIn failed (RLS may still work via RPC login):', error.message)
    return false
  }
  return true
}

export async function signOutSupabaseAuth(): Promise<void> {
  if (!isSupabaseEnabled()) return
  await getSupabase().auth.signOut()
}

export async function restoreSupabaseSession(): Promise<boolean> {
  if (!isSupabaseEnabled()) return false
  const { data } = await getSupabase().auth.getSession()
  return !!data.session
}
