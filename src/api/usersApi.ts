import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { storedUserToRow, userRowToStored, type AppUserRow } from '../lib/dbMappers'
import type { StoredUser, UserFormInput, UserUpdateInput } from '../types/user'
import { hashPassword } from '../lib/password'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return parts[0].slice(0, 1) + parts[1].slice(0, 1)
  return name.slice(0, 2)
}

export async function fetchUsersFromDb(): Promise<StoredUser[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('app_users_public')
    .select('*')
    .order('name')

  if (!error && data) {
    return (data as Omit<AppUserRow, 'password_hash'>[]).map((row) =>
      userRowToStored({ ...row, password_hash: '' }),
    )
  }

  const fallback = await supabase.from('app_users').select('*').order('name')
  if (fallback.error) throw fallback.error
  return (fallback.data as AppUserRow[]).map(userRowToStored)
}

export async function insertUserToDb(input: UserFormInput): Promise<StoredUser> {
  const passwordHash = await hashPassword(input.password)
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}`,
    name: input.name.trim(),
    jobTitle: input.jobTitle.trim(),
    email: input.email.trim(),
    username: input.username.trim().toLowerCase(),
    initials: input.initials?.trim() || initialsFromName(input.name),
    passwordHash,
    accessLevel: input.accessLevel,
    active: true,
  }
  const { error } = await getSupabase().from('app_users').insert(storedUserToRow(user))
  if (error) throw error
  return user
}

export async function updateUserInDb(
  id: string,
  input: UserUpdateInput,
  current: StoredUser,
): Promise<StoredUser> {
  const passwordHash = input.password?.trim()
    ? await hashPassword(input.password)
    : undefined

  const updated: StoredUser = {
    ...current,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.jobTitle !== undefined && { jobTitle: input.jobTitle.trim() }),
    ...(input.email !== undefined && { email: input.email.trim() }),
    ...(input.username !== undefined && { username: input.username.trim().toLowerCase() }),
    ...(input.initials !== undefined && { initials: input.initials.trim() }),
    ...(input.accessLevel !== undefined && { accessLevel: input.accessLevel }),
    ...(input.active !== undefined && { active: input.active }),
    ...(passwordHash && { passwordHash }),
  }

  const { error } = await getSupabase()
    .from('app_users')
    .update(storedUserToRow(updated))
    .eq('id', id)
  if (error) throw error
  return updated
}

export async function deleteUserFromDb(id: string): Promise<void> {
  const { error } = await getSupabase().from('app_users').delete().eq('id', id)
  if (error) throw error
}

export function usersApiAvailable(): boolean {
  return isSupabaseEnabled()
}
