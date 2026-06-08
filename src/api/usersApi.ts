import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  storedUserToRow,
  userRowToStored,
  userUpdateInputToRow,
  type AppUserRow,
} from '../lib/dbMappers'
import { normalizePhoneE164 } from '../lib/phoneUtils'
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

function phoneForDb(raw?: string): string | undefined {
  if (raw === undefined) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  return normalizePhoneE164(trimmed)
}

export async function insertUserToDb(
  input: UserFormInput,
  actorUserId: string,
): Promise<StoredUser> {
  const passwordHash = await hashPassword(input.password)
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}`,
    name: input.name.trim(),
    jobTitle: input.jobTitle.trim(),
    email: input.email.trim(),
    username: input.username.trim().toLowerCase(),
    phone: phoneForDb(input.phone),
    initials: input.initials?.trim() || initialsFromName(input.name),
    passwordHash,
    accessLevel: input.accessLevel,
    active: true,
  }

  const { error: rpcError } = await getSupabase().rpc('insert_app_user_for_session', {
    p_actor_user_id: actorUserId,
    p_user: storedUserToRow(user),
  })

  if (!rpcError) return user

  console.error('insert_app_user_for_session failed', rpcError)
  throw rpcError
}

export async function updateUserInDb(
  id: string,
  input: UserUpdateInput,
  current: StoredUser,
  actorUserId: string,
): Promise<StoredUser> {
  const passwordHash = input.password?.trim()
    ? await hashPassword(input.password)
    : undefined

  const patch = userUpdateInputToRow(input, passwordHash)
  if (input.phone !== undefined) {
    patch.phone = phoneForDb(input.phone) ?? null
  }
  if (Object.keys(patch).length === 0) return current

  const updated: StoredUser = {
    ...current,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.jobTitle !== undefined && { jobTitle: input.jobTitle.trim() }),
    ...(input.email !== undefined && { email: input.email.trim() }),
    ...(input.username !== undefined && { username: input.username.trim().toLowerCase() }),
    ...(input.phone !== undefined && { phone: phoneForDb(input.phone) }),
    ...(input.initials !== undefined && { initials: input.initials.trim() }),
    ...(input.accessLevel !== undefined && { accessLevel: input.accessLevel }),
    ...(input.active !== undefined && { active: input.active }),
    ...(passwordHash && { passwordHash }),
  }

  const { error: rpcError } = await getSupabase().rpc('update_app_user_for_session', {
    p_actor_user_id: actorUserId,
    p_user_id: id,
    p_patch: patch,
  })

  if (!rpcError) return updated

  console.error('update_app_user_for_session failed', rpcError)
  throw rpcError
}

export async function deleteUserFromDb(id: string, actorUserId: string): Promise<void> {
  const { error: rpcError } = await getSupabase().rpc('delete_app_user_for_session', {
    p_actor_user_id: actorUserId,
    p_user_id: id,
  })

  if (!rpcError) return

  console.error('delete_app_user_for_session failed', rpcError)
  throw rpcError
}

export function usersApiAvailable(): boolean {
  return isSupabaseEnabled()
}
