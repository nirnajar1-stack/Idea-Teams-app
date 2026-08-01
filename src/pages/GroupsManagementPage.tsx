import { Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { ManagementPageHeader } from '../components/layout/ManagementPageHeader'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Input } from '../components/ui/Input'
import { useGroups } from '../context/GroupsContext'
import { useUsers } from '../context/UsersContext'
import { cn } from '../lib/cn'

export function GroupsManagementPage() {
  const { groups, create, update, remove } = useGroups()
  const { listManageableUsers } = useUsers()
  const users = listManageableUsers().filter((u) => u.active && u.accessLevel !== 'guest')

  const [name, setName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const editing = useMemo(
    () => (editId ? groups.find((g) => g.id === editId) : null),
    [editId, groups],
  )

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const startEdit = (id: string) => {
    const g = groups.find((x) => x.id === id)
    if (!g) return
    setEditId(id)
    setName(g.name)
    setMemberIds([...g.memberIds])
  }

  const resetForm = () => {
    setEditId(null)
    setName('')
    setMemberIds([])
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('יש להזין שם קבוצה')
      return
    }
    setSaving(true)
    try {
      if (editId) {
        await update(editId, { name: trimmed, memberIds })
        toast.success('הקבוצה עודכנה')
      } else {
        await create({ name: trimmed, memberIds })
        toast.success('הקבוצה נוצרה')
      }
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove(deleteTarget)
      toast.success('הקבוצה הוסרה')
      if (editId === deleteTarget) resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'מחיקה נכשלה')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell variant="main">
      <ManagementPageHeader
        title="קבוצות"
        description="שייכו משתמשים לקבוצות להקצאה ושליחת מיילים."
        icon={<Users className="h-6 w-6 text-primary" aria-hidden />}
      />

      <div className="mb-5 rounded-[1.35rem] bg-surface-container-lowest p-4 shadow-soft md:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-label-md text-on-surface">
          <Plus className="h-5 w-5 text-primary" />
          {editing ? `עריכת קבוצה: ${editing.name}` : 'קבוצה חדשה'}
        </h2>
        <div className="space-y-4">
          <Input
            label="שם הקבוצה"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="למשל: צוות פיתוח, מטה"
          />
          <div>
            <span className="mb-2 block font-label-md text-secondary">חברי הקבוצה</span>
            <div className="max-h-48 space-y-1 overflow-y-auto border border-border-light p-2">
              {users.map((u) => {
                const checked = memberIds.includes(u.id)
                return (
                  <label
                    key={u.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-2 py-1.5 font-label-sm',
                      checked ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(u.id)}
                      className="accent-primary"
                    />
                    {u.name}
                  </label>
                )
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="btn-boutique min-h-12 px-6"
            >
              {editing ? 'שמירת שינויים' : 'יצירת קבוצה'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="btn-secondary-light min-h-12 px-6">
                ביטול
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <p className="font-body-md text-secondary">עדיין אין קבוצות</p>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-border-light bg-surface-container-lowest p-4"
            >
              <div className="flex items-center gap-3 text-right">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-label-md text-on-surface">{g.name}</p>
                  <p className="font-label-sm text-secondary">{g.memberIds.length} חברים</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(g.id)}
                  className="btn-secondary-light px-4 py-2 font-label-sm"
                >
                  עריכה
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(g.id)}
                  className="px-3 py-2 text-error"
                  aria-label="מחיקה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="מחיקת קבוצה"
        message="הקבוצה תוסר. משימות שכבר שויכו אליה יישארו עם המזהה עד לעדכון ידני."
        confirmLabel="מחיקה"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
