import { Ban, Mail, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  addEmailExclusion,
  fetchEmailExclusions,
  fetchEmailSendLog,
  removeEmailExclusion,
  type EmailCompletionExclusion,
  type EmailSendLogEntry,
} from '../api/emailLogApi'
import { AppShell } from '../components/layout/AppShell'
import { ROUTES } from '../constants/app'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { useUsers } from '../context/UsersContext'

const STATUS_LABELS: Record<string, string> = {
  sent: 'נשלח',
  skipped: 'דולג',
  failed: 'נכשל',
}

const REASON_LABELS: Record<string, string> = {
  excluded: 'מוחרג',
  prefs_off: 'כיבה התראות',
  no_email: 'אין אימייל',
  inactive: 'לא פעיל',
  email_not_configured: 'לא מוגדר',
  no_recipients: 'אין נמענים',
  email_send_failed: 'שגיאת שליחה',
}

export function EmailLogPage() {
  const { user } = useAuth()
  const { listManageableUsers } = useUsers()
  const { groups } = useGroups()
  const [logs, setLogs] = useState<EmailSendLogEntry[]>([])
  const [exclusions, setExclusions] = useState<EmailCompletionExclusion[]>([])
  const [loading, setLoading] = useState(true)
  const [excludeUserId, setExcludeUserId] = useState('')
  const [excludeGroupId, setExcludeGroupId] = useState('')

  const users = listManageableUsers().filter((u) => u.active && u.accessLevel !== 'guest')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [logRows, excl] = await Promise.all([
        fetchEmailSendLog(150),
        fetchEmailExclusions(),
      ])
      setLogs(logRows)
      setExclusions(excl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'טעינה נכשלה')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleAddExclusion = async (type: 'user' | 'group', id: string) => {
    if (!user || !id) return
    if (exclusions.some((e) => e.subjectType === type && e.subjectId === id)) {
      toast.error('כבר מוחרג')
      return
    }
    try {
      await addEmailExclusion(type, id, user.id)
      toast.success('נוסף להחרגה')
      await refresh()
      if (type === 'user') setExcludeUserId('')
      else setExcludeGroupId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'הוספה נכשלה')
    }
  }

  const handleRemoveExclusion = async (id: string) => {
    try {
      await removeEmailExclusion(id)
      toast.success('ההחרגה הוסרה')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'הסרה נכשלה')
    }
  }

  const nameForExclusion = (e: EmailCompletionExclusion) => {
    if (e.subjectType === 'user') {
      return users.find((u) => u.id === e.subjectId)?.name ?? e.subjectId
    }
    return groups.find((g) => g.id === e.subjectId)?.name ?? e.subjectId
  }

  return (
    <AppShell variant="main">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 text-right">
        <div>
          <span className="section-eyebrow">מיילים</span>
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">יומן מיילים</h1>
          <p className="font-body-md text-secondary">
            מי נשלח לו מייל בהשלמת משימה, ומי הוחרג משליחה.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="btn-secondary-light flex items-center gap-2 px-4 py-2"
        >
          <RefreshCw className="h-4 w-4" />
          רענון
        </button>
      </div>

      <section className="glass-card mb-8 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-label-md text-on-surface">
          <Ban className="h-5 w-5 text-primary" />
          החרגה משליחת מייל בהשלמה
        </h2>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="flex gap-2">
            <select
              value={excludeUserId}
              onChange={(e) => setExcludeUserId(e.target.value)}
              className="boutique-input flex-1"
            >
              <option value="">החרג משתמש...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-boutique px-4"
              onClick={() => void handleAddExclusion('user', excludeUserId)}
            >
              הוסף
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={excludeGroupId}
              onChange={(e) => setExcludeGroupId(e.target.value)}
              className="boutique-input flex-1"
            >
              <option value="">החרג קבוצה...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-boutique px-4"
              onClick={() => void handleAddExclusion('group', excludeGroupId)}
            >
              הוסף
            </button>
          </div>
        </div>
        {exclusions.length === 0 ? (
          <p className="font-label-sm text-secondary">אין החרגות</p>
        ) : (
          <ul className="space-y-2">
            {exclusions.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between border border-border-light px-3 py-2 font-label-sm"
              >
                <span>
                  {e.subjectType === 'group' ? 'קבוצה' : 'משתמש'}: {nameForExclusion(e)}
                </span>
                <button
                  type="button"
                  className="text-error"
                  onClick={() => void handleRemoveExclusion(e.id)}
                >
                  הסר
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-label-md text-on-surface">
          <Mail className="h-5 w-5 text-primary" />
          היסטוריית שליחות
        </h2>
        {loading ? (
          <p className="font-body-md text-secondary">טוען...</p>
        ) : logs.length === 0 ? (
          <p className="font-body-md text-secondary">עדיין לא נשלחו מיילים</p>
        ) : (
          <div className="overflow-x-auto border border-border-light">
            <table className="w-full min-w-[640px] text-right font-label-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="p-3 font-label-md">זמן</th>
                  <th className="p-3 font-label-md">משימה</th>
                  <th className="p-3 font-label-md">נמען</th>
                  <th className="p-3 font-label-md">אימייל</th>
                  <th className="p-3 font-label-md">סטטוס</th>
                  <th className="p-3 font-label-md">מי השלים</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} className="border-t border-border-light">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString('he-IL')}
                    </td>
                    <td className="p-3">
                      {row.ideaId ? (
                        <Link
                          to={ROUTES.ideaDetail(row.ideaId)}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {row.ideaTitle ?? row.ideaId}
                        </Link>
                      ) : (
                        row.ideaTitle ?? '—'
                      )}
                    </td>
                    <td className="p-3">{row.recipientName ?? '—'}</td>
                    <td className="p-3">{row.recipientEmail}</td>
                    <td className="p-3">
                      {STATUS_LABELS[row.status] ?? row.status}
                      {row.reason ? (
                        <span className="block text-secondary">
                          {REASON_LABELS[row.reason] ?? row.reason}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3">{row.actorName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  )
}
