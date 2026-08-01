import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  PERMISSIONS_STORAGE_KEY,
  type PermissionKey,
  type PermissionMode,
  type PermissionRule,
} from '../types/permission'

interface RuleRow {
  key: string
  mode: string
  group_ids: string[] | null
  updated_at: string | null
  updated_by_user_id: string | null
}

function readLocal(): PermissionRule[] {
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PermissionRule[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(rules: PermissionRule[]): void {
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(rules))
}

function rowToRule(row: RuleRow): PermissionRule {
  return {
    key: row.key as PermissionKey,
    mode: row.mode as PermissionMode,
    groupIds: row.group_ids ?? [],
    updatedAt: row.updated_at ?? undefined,
    updatedByUserId: row.updated_by_user_id ?? undefined,
  }
}

export async function fetchPermissionRules(): Promise<PermissionRule[]> {
  if (!isSupabaseEnabled()) return readLocal()

  try {
    const { data, error } = await getSupabase()
      .from('app_permission_rules')
      .select('key, mode, group_ids, updated_at, updated_by_user_id')
    if (error) throw error
    const rules = ((data as RuleRow[]) ?? []).map(rowToRule)
    writeLocal(rules)
    return rules
  } catch (err) {
    console.warn('fetchPermissionRules cloud failed', err)
    return readLocal()
  }
}

export async function upsertPermissionRule(
  rule: PermissionRule,
  actorUserId: string,
): Promise<PermissionRule> {
  const next: PermissionRule = {
    ...rule,
    groupIds: rule.mode === 'groups' ? [...new Set(rule.groupIds)] : [],
    updatedAt: new Date().toISOString(),
    updatedByUserId: actorUserId,
  }

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase().from('app_permission_rules').upsert(
      {
        key: next.key,
        mode: next.mode,
        group_ids: next.groupIds,
        updated_at: next.updatedAt,
        updated_by_user_id: actorUserId,
      },
      { onConflict: 'key' },
    )
    if (error) throw error
  }

  const all = readLocal().filter((r) => r.key !== next.key)
  all.push(next)
  writeLocal(all)
  return next
}

export async function upsertPermissionRules(
  rules: PermissionRule[],
  actorUserId: string,
): Promise<PermissionRule[]> {
  const saved: PermissionRule[] = []
  for (const rule of rules) {
    saved.push(await upsertPermissionRule(rule, actorUserId))
  }
  return saved
}
