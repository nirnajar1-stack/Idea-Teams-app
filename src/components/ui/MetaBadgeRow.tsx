import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface MetaBadgeRowProps {
  primary: ReactNode
  secondary?: ReactNode
  className?: string
}

/** מציג 2–3 badges ראשיים; השאר מאחורי "עוד" */
export function MetaBadgeRow({ primary, secondary, className }: MetaBadgeRowProps) {
  const [open, setOpen] = useState(false)
  const hasSecondary = Boolean(secondary)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {primary}
      {hasSecondary && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border-light bg-surface-container-lowest px-2.5 py-1 font-label-sm text-secondary shadow-soft transition-colors hover:text-on-surface"
            aria-expanded={open}
          >
            עוד
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
          {open && secondary}
        </>
      )}
    </div>
  )
}
