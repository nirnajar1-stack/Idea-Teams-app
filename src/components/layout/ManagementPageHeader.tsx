import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ManagementPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

/** כותרת אחידה למסכי ניהול */
export function ManagementPageHeader({
  eyebrow = 'ניהול מערכת',
  title,
  description,
  action,
  icon,
  className,
}: ManagementPageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 text-right">
        <span className="section-eyebrow">{eyebrow}</span>
        <h1 className="mt-1 flex items-center justify-end gap-2 font-display text-headline-lg text-on-surface">
          {icon}
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-body-sm text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
