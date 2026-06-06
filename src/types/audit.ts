export type AuditEntityType = 'idea' | 'user' | 'chat'

export interface AuditEntry {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: string
  actorUserId?: string
  actorName: string
  details: Record<string, unknown>
  createdAt: string
}

export interface AuditLogInput {
  entityType: AuditEntityType
  entityId: string
  action: string
  actorUserId?: string
  actorName: string
  details?: Record<string, unknown>
}
