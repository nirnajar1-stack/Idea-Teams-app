import { Pencil, Plus, Shield, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
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

export function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const { listManageableUsers, createUser, updateUser, deleteUser } = useUsers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StoredUser | null>(null)

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
    if (editing) {
      await updateUser(editing.id, data as UserUpdateInput)
    } else {
      await createUser(data as UserFormInput)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = (u: StoredUser) => {
    if (u.id === currentUser?.id) {
      window.alert('לא ניתן למחוק את המשתמש המחובר כעת.')
      return
    }
    const managers = users.filter((x) => x.accessLevel === 'manager' && x.active)
    if (u.accessLevel === 'manager' && managers.length <= 1) {
      window.alert('חייב להישאר לפחות מנהל פעיל אחד.')
      return
    }
    if (window.confirm(`למחוק את ${u.name}? פעולה זו אינה ניתנת לביטול.`)) {
      deleteUser(u.id)
    }
  }

  return (
    <AppShell variant="main">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="section-eyebrow">
            <UserCog className="h-3.5 w-3.5" />
            ניהול משתמשים
          </span>
          <h1 className="font-display text-headline-lg text-on-surface">
            משתמשים והרשאות
          </h1>
          <p className="mt-2 max-w-xl font-body-md text-secondary">
            הוספה, עריכה והגדרת סיסמאות. רמות גישה: {ACCESS_LEVEL_LABELS.manager},{' '}
            {ACCESS_LEVEL_LABELS.member} ו{ACCESS_LEVEL_LABELS.guest} (כניסה נפרדת).
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
            <thead>
              <tr className="border-b border-border-light/80 bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-secondary">שם</th>
                <th className="px-6 py-4 font-label-md text-secondary">שם משתמש</th>
                <th className="px-6 py-4 font-label-md text-secondary">תפקיד</th>
                <th className="px-6 py-4 font-label-md text-secondary">רמת גישה</th>
                <th className="px-6 py-4 font-label-md text-secondary">סטטוס</th>
                <th className="px-6 py-4 font-label-md text-secondary">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border-light transition-colors hover:bg-surface-container-low/60"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-label-md text-primary">
                        {u.initials}
                      </span>
                      <div>
                        <p className="font-label-md text-on-surface">{u.name}</p>
                        <p className="font-label-sm text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface-variant">
                    {u.username}
                  </td>
                  <td className="px-6 py-4 font-body-md">{u.jobTitle}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-sm',
                        u.accessLevel === 'manager'
                          ? 'bg-primary/10 text-primary'
                          : u.accessLevel === 'master'
                            ? 'bg-inbox/10 text-inbox'
                            : 'bg-surface-container text-on-surface-variant',
                      )}
                    >
                      {u.accessLevel === 'manager' && (
                        <Shield className="h-3.5 w-3.5" />
                      )}
                      {u.accessLevel === 'master' && (
                        <Shield className="h-3.5 w-3.5" />
                      )}
                      {ACCESS_LEVEL_LABELS[u.accessLevel]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'font-label-sm',
                        u.active ? 'text-success-vibrant' : 'text-error',
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
                        className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                        aria-label={`עריכת ${u.name}`}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="rounded-lg p-2 text-error transition-colors hover:bg-error/10"
                        aria-label={`מחיקת ${u.name}`}
                      >
                        <Trash2 className="h-5 w-5" />
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
    </AppShell>
  )
}
