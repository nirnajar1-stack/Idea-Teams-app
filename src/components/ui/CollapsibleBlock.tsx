import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface CollapsibleBlockProps {
  title: string
  /** ברירת מחדל פתוח בדסקטופ, סגור במובייל */
  defaultOpenDesktop?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleBlock({
  title,
  defaultOpenDesktop = true,
  children,
  className,
}: CollapsibleBlockProps) {
  const panelId = useId()
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpenDesktop
    return window.matchMedia('(min-width: 1024px)').matches ? defaultOpenDesktop : false
  })

  return (
    <section className={cn('glass-card overflow-hidden', className)}>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 px-6 py-4 text-right transition-colors hover:bg-surface-container-low/50"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="font-display text-headline-md text-on-surface">{title}</h2>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-secondary transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div id={panelId} className="border-t border-border-light px-6 pb-6 pt-4">
          {children}
        </div>
      )}
    </section>
  )
}
