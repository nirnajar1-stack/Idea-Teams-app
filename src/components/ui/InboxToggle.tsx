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
        'group w-full rounded-2xl border-2 p-5 text-right transition-all duration-300',
        checked
          ? 'border-inbox/40 bg-inbox-soft shadow-glow'
          : 'border-border-light bg-surface-container-low/80 hover:border-primary/30 hover:bg-surface-container',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
            checked ? 'bg-inbox/15 text-inbox' : 'bg-surface-container-low text-secondary',
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
            checked ? 'bg-inbox' : 'bg-outline-variant/50',
          )}
        >
          <div
            className={cn(
              'h-5 w-5 rounded-full bg-on-surface shadow-sm transition-all duration-200',
              checked && 'ms-auto',
            )}
          />
        </div>
      </div>
    </button>
  )
}
