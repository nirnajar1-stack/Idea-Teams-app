import { Pencil, Plus, Shield, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { UserFormModal } from '../components/sections/UserFormModal'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../context/UsersContext'
import {
  ACCESS_LEVEL_LABELS,
  type StoredUser,
  type UserFormInput,
  type UserUpdateInput,
} from '../types/user'
import { cn } from '../lib/cn'
import { formatUserSaveError } from '../lib/userSaveErrors'

export function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const { listManageableUsers, createUser, updateUser, deleteUser } = useUsers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StoredUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StoredUser | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const users = listManageableUsers()

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (u: StoredUser) => {
    setEditing(u)
    setModalOpen(true)
  }

  const handleSave = async (data: UserFormInput | UserUpdateInput) => {
    if (!currentUser?.id) {
      toast.error('יש להתחבר כמנהל או מאסטר כדי לשמור משתמשים')
      return
    }
    try {
      if (editing) {
        await updateUser(editing.id, data as UserUpdateInput, currentUser.id)
      } else {
        await createUser(data as UserFormInput, currentUser.id)
      }
      setModalOpen(false)
      setEditing(null)
      toast.success(editing ? 'המשתמש עודכן' : 'המשתמש נוסף')
    } catch (err) {
      const detail =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : String(err)
      console.error('save user failed', err)
      toast.error(`${formatUserSaveError(err)}${detail ? ` (${detail})` : ''}`)
    }
  }

  const handleDelete = (u: StoredUser) => {
    if (u.id === currentUser?.id) {
      setAlertMessage('לא ניתן למחוק את המשתמש המחובר כעת.')
      return
    }
    const managers = users.filter((x) => x.accessLevel === 'manager' && x.active)
    if (u.accessLevel === 'manager' && managers.length <= 1) {
      setAlertMessage('חייב להישאר לפחות מנהל פעיל אחד.')
      return
    }
    setDeleteTarget(u)
  }

  const confirmDelete = () => {
    if (!deleteTarget || !currentUser?.id) return
    const target = deleteTarget
    setDeleteTarget(null)
    void deleteUser(target.id, currentUser.id)
      .then(() => toast.success(`${target.name} נמחק`))
      .catch((err) => {
        console.error('delete user failed', err)
        toast.error(formatUserSaveError(err))
      })
  }

  return (
    <AppShell variant="main">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="section-eyebrow">
            <Shield className="h-3.5 w-3.5" />
            ניהול
          </span>
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">
            ניהול משתמשים
          </h1>
          <p className="font-body-md text-secondary">
            הוספה, עריכה והשבתה של משתמשי המערכת.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-boutique inline-flex items-center gap-2">
          <Plus className="h-5 w-5" />
          משתמש חדש
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right">
            <thead className="border-b border-border-light bg-surface-subtle">
              <tr>
                <th className="px-6 py-4 font-label-md text-secondary">שם</th>
                <th className="px-6 py-4 font-label-md text-secondary">תפקיד</th>
                <th className="px-6 py-4 font-label-md text-secondary">רמה</th>
                <th className="px-6 py-4 font-label-md text-secondary">סטטוס</th>
                <th className="px-6 py-4 font-label-md text-secondary">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-surface-subtle/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <UserCog className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">{u.name}</p>
                        <p className="font-label-sm text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant">
                    {u.jobTitle}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-label-sm text-primary">
                      {ACCESS_LEVEL_LABELS[u.accessLevel]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 font-label-sm',
                        u.active
                          ? 'bg-success-vibrant/10 text-success-vibrant'
                          : 'bg-secondary/10 text-secondary',
                      )}
                    >
                      {u.active ? 'פעיל' : 'מושבת'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="rounded-lg p-2 text-primary hover:bg-primary/10"
                        aria-label={`עריכת ${u.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="rounded-lg p-2 text-error hover:bg-error/10"
                        aria-label={`מחיקת ${u.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <UserFormModal
          user={editing}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="מחיקת משתמש"
        message={deleteTarget ? `למחוק את ${deleteTarget.name}? פעולה זו אינה ניתנת לביטול.` : ''}
        confirmLabel="מחק"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!alertMessage}
        title="שגיאה"
        message={alertMessage ?? ''}
        confirmLabel="הבנתי"
        cancelLabel="סגור"
        onConfirm={() => setAlertMessage(null)}
        onCancel={() => setAlertMessage(null)}
      />
    </AppShell>
  )
}
