import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import type { AuditEntry, AuditLogInput } from '../types/audit'

interface AuditRow {
  id: string
  entity_type: string
  entity_id: string
  action: string
  actor_user_id: string | null
  actor_name: string
  details: Record<string, unknown>
  created_at: string
}

function rowToEntry(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    entityType: row.entity_type as AuditEntry['entityType'],
    entityId: row.entity_id,
    action: row.action,
    actorUserId: row.actor_user_id ?? undefined,
    actorName: row.actor_name,
    details: row.details ?? {},
    createdAt: row.created_at,
  }
}

export async function insertAuditEntry(input: AuditLogInput): Promise<void> {
  if (!isSupabaseEnabled()) return
  const { error } = await getSupabase().from('audit_log').insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    actor_user_id: input.actorUserId ?? null,
    actor_name: input.actorName,
    details: input.details ?? {},
  })
  if (error) console.warn('audit_log insert failed', error.message)
}

export async function fetchAuditForEntity(
  entityType: AuditEntry['entityType'],
  entityId: string,
  limit = 50,
): Promise<AuditEntry[]> {
  if (!isSupabaseEnabled()) return []
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as AuditRow[]).map(rowToEntry)
}

export async function fetchRecentAudit(limit = 30): Promise<AuditEntry[]> {
  if (!isSupabaseEnabled()) return []
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as AuditRow[]).map(rowToEntry)
}
