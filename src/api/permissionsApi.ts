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

function formatSupabaseError(error: { message?: string; details?: string; hint?: string; code?: string }): string {
  const parts = [error.message, error.details, error.hint].filter(Boolean)
  return parts.join(' — ') || 'שמירת הרשאות נכשלה'
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
  const saved = await upsertPermissionRules([rule], actorUserId)
  return saved[0]!
}

export async function upsertPermissionRules(
  rules: PermissionRule[],
  actorUserId: string,
): Promise<PermissionRule[]> {
  if (rules.length === 0) return []

  const now = new Date().toISOString()
  const nextRules: PermissionRule[] = rules.map((rule) => ({
    ...rule,
    groupIds: rule.mode === 'groups' ? [...new Set(rule.groupIds)] : [],
    updatedAt: now,
    updatedByUserId: actorUserId,
  }))

  if (isSupabaseEnabled()) {
    const payload = nextRules.map((r) => ({
      key: r.key,
      mode: r.mode,
      group_ids: r.groupIds,
      updated_at: r.updatedAt,
      updated_by_user_id: actorUserId,
    }))

    const { data, error } = await getSupabase()
      .from('app_permission_rules')
      .upsert(payload, { onConflict: 'key' })
      .select('key, mode, group_ids, updated_at, updated_by_user_id')

    if (error) {
      console.error('upsertPermissionRules failed', error)
      throw new Error(formatSupabaseError(error))
    }

    const saved = ((data as RuleRow[]) ?? []).map(rowToRule)
    const byKey = new Map(saved.map((r) => [r.key, r]))
    const merged = nextRules.map((r) => byKey.get(r.key) ?? r)

    const all = readLocal().filter((r) => !merged.some((m) => m.key === r.key))
    all.push(...merged)
    writeLocal(all)
    return merged
  }

  const all = readLocal().filter((r) => !nextRules.some((m) => m.key === r.key))
  all.push(...nextRules)
  writeLocal(all)
  return nextRules
}
