import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  ACCESS_LEVEL_LABELS,
  type StoredUser,
  type UserFormInput,
  type UserUpdateInput,
} from '../../types/user'
import { isValidIsraeliPhone } from '../../lib/phoneUtils'

interface UserFormModalProps {
  user: StoredUser | null
  onClose: () => void
  onSave: (data: UserFormInput | UserUpdateInput) => Promise<void>
}

export function UserFormModal({ user, onClose, onSave }: UserFormModalProps) {
  const isEdit = user !== null
  const [name, setName] = useState(user?.name ?? '')
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [password, setPassword] = useState('')
  const [accessLevel, setAccessLevel] = useState<'manager' | 'member' | 'master'>(
    user?.accessLevel === 'manager'
      ? 'manager'
      : user?.accessLevel === 'master'
        ? 'master'
        : 'member',
  )
  const [active, setActive] = useState(user?.active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEdit && password.length < 4) {
      toast.error('סיסמה חייבת להכיל לפחות 4 תווים')
      return
    }
    if (phone.trim() && !isValidIsraeliPhone(phone)) {
      toast.error('מספר טלפון לא תקין (לדוגמה 050-1234567)')
      return
    }
    if (password.trim() && password.trim().length < 4) {
      toast.error('סיסמה חייבת להכיל לפחות 4 תווים')
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        const patch: UserUpdateInput = {
          name,
          jobTitle,
          email,
          username,
          accessLevel,
          active,
          phone: phone.trim(),
        }
        if (password.trim()) patch.password = password
        await onSave(patch)
      } else {
        await onSave({
          name,
          jobTitle,
          email,
          username,
          password,
          accessLevel,
          phone: phone.trim() || undefined,
        } satisfies UserFormInput)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="user-form-title"
    >
      <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-8 shadow-boutique">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="user-form-title" className="font-display text-headline-md text-on-surface">
            {isEdit ? 'עריכת משתמש' : 'משתמש חדש'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-secondary hover:bg-primary/5"
            aria-label="סגירה"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label-md">שם מלא</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="boutique-input"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md">תפקיד / תיאור</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="boutique-input"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="boutique-input"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md">שם משתמש</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="boutique-input"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md">טלפון WhatsApp (אופציונלי)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="boutique-input"
              placeholder="050-1234567"
              dir="ltr"
            />
            <p className="mt-1 font-label-sm text-secondary">
              לקבלת הודעה אוטומטית כשבקשה/רעיון מוקצה מסומן כהושלם
            </p>
          </div>
          <div>
            <label className="mb-1 block font-label-md">
              סיסמה {isEdit && '(השאירו ריק ללא שינוי)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="boutique-input"
              required={!isEdit}
              minLength={isEdit ? 0 : 4}
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md">רמת גישה</label>
            <select
              value={accessLevel}
              onChange={(e) =>
                setAccessLevel(e.target.value as 'manager' | 'member' | 'master')
              }
              className="boutique-input"
            >
              <option value="manager">{ACCESS_LEVEL_LABELS.manager}</option>
              <option value="member">{ACCESS_LEVEL_LABELS.member}</option>
              <option value="master">{ACCESS_LEVEL_LABELS.master}</option>
            </select>
          </div>
          {isEdit && (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded text-primary"
              />
              <span className="font-body-md">משתמש פעיל</span>
            </label>
          )}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-boutique flex-1">
              {saving ? 'שומר…' : 'שמירה'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border-light py-3.5 font-label-md text-secondary hover:bg-surface-container"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
