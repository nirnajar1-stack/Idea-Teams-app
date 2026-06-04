import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function isSupabaseEnabled(): boolean {
  return Boolean(url?.trim() && anonKey?.trim())
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase לא מוגדר — הוסף VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY ל-.env')
  }
  if (!client) {
    client = createClient(url!, anonKey!)
  }
  return client
}
