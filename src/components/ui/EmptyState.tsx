import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="lambo-empty flex flex-col items-center justify-center py-section text-center">
      <span className="section-eyebrow mx-auto justify-center">אין תוכן</span>
      <h2 className="mt-4 font-display text-headline-lg text-on-background">{title}</h2>
      {description && (
        <p className="mt-4 max-w-md text-body-md text-secondary">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}
