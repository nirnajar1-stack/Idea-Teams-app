import { Tag, X } from 'lucide-react'
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
  const { labels, getLabelById, isReady } = useLabels()

  const toggle = (id: string) => {
    if (disabled) return
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const removeOne = (id: string) => {
    if (disabled) return
    onChange(value.filter((v) => v !== id))
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
              {!disabled && value.length > 0 && ' · לחץ ✕ להסרת לייבל משויך'}
            </p>
          </div>
        </div>
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={clearAll}
            className="font-label-sm text-secondary hover:text-error"
          >
            הסר את כל הלייבלים
          </button>
        )}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <span className="block font-label-sm text-secondary">לייבלים משויכים לבקשה</span>
          <div className="flex flex-wrap gap-2">
            {value.map((id) => {
              const label = getLabelById(id)
              const name = label?.name ?? id
              const color = label?.color ?? '#64748b'
              return (
                <span
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary',
                    disabled && 'opacity-70',
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeOne(id)}
                      className="mr-0.5 rounded-full p-0.5 text-primary/70 transition-colors hover:bg-primary/20 hover:text-error"
                      aria-label={`הסר לייבל ${name}`}
                      title={`הסר ${name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {!isReady && (
        <p className="font-body-md text-secondary">טוען לייבלים...</p>
      )}

      {isReady && labels.length === 0 && value.length === 0 && (
        <p className="rounded border border-dashed border-border-light bg-surface-subtle px-4 py-3 font-body-md text-secondary">
          טרם הוגדרו לייבלים. מאסטר יכול ליצור לייבלים חדשים במסך ניהול לייבלים.
        </p>
      )}

      {!disabled && labels.length > 0 && (
        <div className="space-y-2">
          <span className="block font-label-sm text-secondary">הוסף לייבל מהרשימה</span>
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
              if (selected) return null
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggle(label.id)}
                  className="inline-flex items-center gap-2 border border-border-light bg-surface-container-lowest px-3 py-2 text-sm text-on-surface-variant transition-colors hover:border-primary/30"
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
            {labels.every((l) => value.includes(l.id)) && (
              <p className="font-label-sm text-secondary">כל הלייבלים כבר משויכים</p>
            )}
          </div>
        </div>
      )}

      {disabled && value.length === 0 && (
        <p className="font-body-md text-secondary">ללא לייבלים</p>
      )}

      {value.length > 0 && (
        <p className="font-label-sm text-secondary">
          משויכים {value.length} לייבלים
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
