import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  /** ברירת מחדל: בלי eyebrow כללי */
  showEyebrow?: boolean
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  showEyebrow = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 text-center md:py-12',
        className,
      )}
    >
      {showEyebrow && (
        <span className="section-eyebrow mx-auto justify-center">אין תוכן</span>
      )}
      <h2
        className={cn(
          'font-display text-headline-md text-on-background md:text-headline-lg',
          showEyebrow && 'mt-3',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-sm text-body-sm text-secondary md:mt-3">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
