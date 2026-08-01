import { useEffect, useState } from 'react'
import { History, Loader2 } from 'lucide-react'
import { fetchAuditForEntity } from '../../api/auditApi'
import { isSupabaseEnabled } from '../../lib/supabaseClient'
import type { AuditEntry, AuditEntityType } from '../../types/audit'

const ACTION_LABELS: Record<string, string> = {
  created: 'נוצר',
  updated: 'עודכן',
  deleted: 'נמחק',
  status_changed: 'סטטוס השתנה',
  assignee_changed: 'הוקצה משתמש',
  attachment_added: 'קובץ נוסף',
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function AuditLogSection({
  entityType,
  entityId,
  embedded = false,
}: {
  entityType: AuditEntityType
  entityId: string
  embedded?: boolean
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSupabaseEnabled()) return
    setLoading(true)
    void fetchAuditForEntity(entityType, entityId)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [entityType, entityId])

  if (!isSupabaseEnabled()) return null

  const body = (
    <>
      {loading && (
        <div className="flex items-center gap-2 text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-label-md">טוען…</span>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="font-body-md text-secondary">אין רשומות עדיין</p>
      )}

      <ul className="space-y-3">
        {entries.map((e) => (
          <li
            key={e.id}
            className="border border-border-light bg-surface-subtle px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label-md text-on-surface">
                {ACTION_LABELS[e.action] ?? e.action}
              </span>
              <span className="font-label-sm text-secondary">{formatTime(e.createdAt)}</span>
            </div>
            <p className="mt-1 font-label-sm text-secondary">על ידי {e.actorName}</p>
          </li>
        ))}
      </ul>
    </>
  )

  if (embedded) return <div>{body}</div>

  return (
    <section className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2 text-primary">
        <History className="h-5 w-5" />
        <h2 className="font-display text-headline-md text-on-surface">היסטוריית שינויים</h2>
      </div>
      {body}
    </section>
  )
}
