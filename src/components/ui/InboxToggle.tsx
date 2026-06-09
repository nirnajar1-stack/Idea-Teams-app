import { Archive, Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface InboxToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function InboxToggle({ checked, onChange }: InboxToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'group w-full border p-5 text-right transition-colors duration-300',
        checked
          ? 'border-primary bg-primary/5'
          : 'border-border-light bg-surface-container-lowest hover:bg-surface-container-low',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center transition-colors',
            checked ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-secondary',
          )}
        >
          {checked ? (
            <Archive className="h-6 w-6" aria-hidden />
          ) : (
            <Sparkles className="h-6 w-6" aria-hidden />
          )}
        </div>
        <div className="flex-1">
          <p className="mb-1 font-label-md text-on-surface">
            שלח ל-Inbox — אולי בהמשך
          </p>
          <p className="font-body-md text-secondary">
            הבקשה/רעיון יישמר בנפרד מלוח הפעיל, לבחינה עתידית בלי לחץ ביצוע.
          </p>
        </div>
        <div
          className={cn(
            'mt-1 flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors',
            checked ? 'bg-primary' : 'bg-outline-variant/50',
          )}
        >
          <div
            className={cn(
              'h-5 w-5 rounded-full bg-on-surface transition-all duration-200',
              checked && 'ms-auto',
            )}
          />
        </div>
      </div>
    </button>
  )
}
