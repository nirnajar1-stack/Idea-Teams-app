import { Tag } from 'lucide-react'
import { useLabels } from '../../context/LabelsContext'
import { cn } from '../../lib/cn'

export interface TaskLabelSelectProps {
  value: string[]
  onChange: (labelIds: string[]) => void
  disabled?: boolean
  required?: boolean
  error?: boolean
}

export function TaskLabelSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
}: TaskLabelSelectProps) {
  const { labels, isReady } = useLabels()

  const toggle = (id: string) => {
    if (disabled) return
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const clearAll = () => {
    if (!disabled) onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Tag className="h-5 w-5" />
          <div>
            <span className="font-label-md text-on-surface">
              לייבלים
              {required && <span className="mr-1 text-error">*</span>}
            </span>
            <p className="mt-0.5 font-label-sm text-secondary">
              בחר מתוך הלייבלים הקיימים — ניתן לשייך כמה לייבלים
            </p>
          </div>
        </div>
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={clearAll}
            className="font-label-sm text-secondary hover:text-error"
          >
            נקה בחירה
          </button>
        )}
      </div>

      {!isReady && (
        <p className="font-body-md text-secondary">טוען לייבלים...</p>
      )}

      {isReady && labels.length === 0 && (
        <p className="rounded border border-dashed border-border-light bg-surface-subtle px-4 py-3 font-body-md text-secondary">
          טרם הוגדרו לייבלים. מאסטר יכול ליצור לייבלים חדשים במסך ניהול לייבלים.
        </p>
      )}

      {labels.length > 0 && (
        <div
          className={cn(
            'flex flex-wrap gap-2 rounded border border-border-light bg-surface-subtle p-3',
            error && 'border-error/40',
          )}
          role="group"
          aria-label="בחירת לייבלים"
        >
          {labels.map((label) => {
            const selected = value.includes(label.id)
            return (
              <button
                key={label.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(label.id)}
                className={cn(
                  'inline-flex items-center gap-2 border px-3 py-2 text-sm transition-colors',
                  selected
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border-light bg-surface-container-lowest text-on-surface-variant hover:border-primary/30',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                  aria-hidden
                />
                {label.name}
              </button>
            )
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="font-label-sm text-secondary">
          נבחרו {value.length} לייבלים
        </p>
      )}

      {error && (
        <p className="text-sm text-error">יש לבחור לפחות לייבל אחד</p>
      )}
    </div>
  )
}

export function TaskLabelBadges({ labelIds }: { labelIds: string[] }) {
  const { labels, getLabelById } = useLabels()

  if (!labelIds.length) {
    return <span className="font-body-md text-secondary">ללא לייבלים</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labelIds.map((id) => {
        const label = getLabelById(id)
        const name = label?.name ?? id
        const color = label?.color ?? '#64748b'
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-surface-container-low/80 px-3 py-1 text-[13px] text-on-surface-variant"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </span>
        )
      })}
      {labels.length === 0 && labelIds.length > 0 && (
        <span className="text-xs text-secondary">({labelIds.length} לייבלים)</span>
      )}
    </div>
  )
}
