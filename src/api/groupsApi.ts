import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { GROUPS_STORAGE_KEY } from '../types/group'
import type { AppGroup, AppGroupInput } from '../types/group'

interface GroupRow {
  id: string
  name: string
  active: boolean
  created_at: string
  created_by_user_id: string | null
}

function readLocal(): AppGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AppGroup[]
    return Array.isArray(parsed) ? parsed.filter((g) => g.active !== false) : []
  } catch {
    return []
  }
}

function writeLocal(groups: AppGroup[]): void {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
}

export async function fetchGroups(): Promise<AppGroup[]> {
  if (!isSupabaseEnabled()) return readLocal()

  try {
    const { data: groups, error } = await getSupabase()
      .from('app_groups')
      .select('*')
      .eq('active', true)
      .order('name')
    if (error) throw error

    const ids = (groups as GroupRow[]).map((g) => g.id)
    let membersByGroup = new Map<string, string[]>()
    if (ids.length > 0) {
      const { data: members, error: memErr } = await getSupabase()
        .from('app_group_members')
        .select('group_id, user_id')
        .in('group_id', ids)
      if (memErr) throw memErr
      membersByGroup = new Map()
      for (const m of members ?? []) {
        const gid = m.group_id as string
        const list = membersByGroup.get(gid) ?? []
        list.push(m.user_id as string)
        membersByGroup.set(gid, list)
      }
    }

    const result: AppGroup[] = (groups as GroupRow[]).map((g) => ({
      id: g.id,
      name: g.name,
      active: g.active,
      createdAt: g.created_at.slice(0, 10),
      createdByUserId: g.created_by_user_id ?? undefined,
      memberIds: membersByGroup.get(g.id) ?? [],
    }))
    writeLocal(result)
    return result
  } catch (err) {
    console.warn('fetchGroups cloud failed', err)
    return readLocal()
  }
}

export async function createGroup(
  input: AppGroupInput,
  actorUserId: string,
): Promise<AppGroup> {
  const group: AppGroup = {
    id: `grp-${Date.now().toString(36)}`,
    name: input.name.trim(),
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    createdByUserId: actorUserId,
    memberIds: [...new Set(input.memberIds)],
  }

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase().from('app_groups').insert({
      id: group.id,
      name: group.name,
      active: true,
      created_by_user_id: actorUserId,
    })
    if (error) throw error
    if (group.memberIds.length > 0) {
      const { error: memErr } = await getSupabase()
        .from('app_group_members')
        .insert(group.memberIds.map((user_id) => ({ group_id: group.id, user_id })))
      if (memErr) throw memErr
    }
  }

  const all = [...readLocal(), group]
  writeLocal(all)
  return group
}

export async function updateGroup(
  id: string,
  patch: Partial<Pick<AppGroup, 'name' | 'active' | 'memberIds'>>,
): Promise<void> {
  const local = readLocal()
  const next = local.map((g) => (g.id === id ? { ...g, ...patch } : g))
  writeLocal(next)

  if (!isSupabaseEnabled()) return

  if (patch.name !== undefined || patch.active !== undefined) {
    const { error } = await getSupabase()
      .from('app_groups')
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.active !== undefined ? { active: patch.active } : {}),
      })
      .eq('id', id)
    if (error) throw error
  }

  if (patch.memberIds !== undefined) {
    const { error: delErr } = await getSupabase()
      .from('app_group_members')
      .delete()
      .eq('group_id', id)
    if (delErr) throw delErr
    if (patch.memberIds.length > 0) {
      const { error: insErr } = await getSupabase()
        .from('app_group_members')
        .insert(patch.memberIds.map((user_id) => ({ group_id: id, user_id })))
      if (insErr) throw insErr
    }
  }
}

export async function deleteGroup(id: string): Promise<void> {
  await updateGroup(id, { active: false })
}
