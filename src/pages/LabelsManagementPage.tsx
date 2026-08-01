import { Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { ManagementPageHeader } from '../components/layout/ManagementPageHeader'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Input } from '../components/ui/Input'
import { useLabels } from '../context/LabelsContext'
import { LABEL_COLORS } from '../types/label'
import { cn } from '../lib/cn'

export function LabelsManagementPage() {
  const { labels, createLabel, deleteLabel } = useLabels()
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(LABEL_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('יש להזין שם לייבל')
      return
    }
    if (labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('לייבל בשם זה כבר קיים')
      return
    }

    setSaving(true)
    try {
      await createLabel({ name: trimmed, color })
      setName('')
      toast.success('הלייבל נוצר')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'יצירת לייבל נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteLabel(deleteTarget)
      toast.success('הלייבל הוסר')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'מחיקה נכשלה')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell variant="main">
      <ManagementPageHeader
        title="ניהול לייבלים"
        description="צרו לייבלים לשיוך במשימות. יצירה למאסטר בלבד."
        icon={<Tag className="h-6 w-6 text-primary" aria-hidden />}
      />

      <div className="mb-5 rounded-[1.35rem] bg-surface-container-lowest p-4 shadow-soft md:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-label-md text-on-surface">
          <Plus className="h-5 w-5 text-primary" />
          לייבל חדש
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Input
            label="שם הלייבל"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="למשל: דחוף, משרד הכלכלה, תשתית"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void handleCreate())}
          />
          <div>
            <span className="mb-2 block font-label-md text-secondary">צבע</span>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-on-surface scale-110' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`צבע ${c}`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={saving}
            className="btn-boutique min-h-12 px-6"
          >
            {saving ? 'שומר...' : 'הוסף לייבל'}
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-label-md text-on-surface">
          <Tag className="h-5 w-5 text-primary" />
          לייבלים פעילים ({labels.length})
        </h2>
        {labels.length === 0 ? (
          <p className="font-body-md text-secondary">טרם נוצרו לייבלים.</p>
        ) : (
          <ul className="space-y-2">
            {labels.map((label) => (
              <li
                key={label.id}
                className="flex items-center justify-between gap-4 border border-border-light bg-surface-subtle px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="font-label-md text-on-surface">{label.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(label.id)}
                  className="p-2 text-secondary hover:text-error"
                  aria-label={`מחק ${label.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="מחיקת לייבל"
        message="הלייבל יוסר מהקטלוג. משימות שכבר משויכות אליו ישמרו את השיוך ההיסטורי."
        confirmLabel="מחק"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
