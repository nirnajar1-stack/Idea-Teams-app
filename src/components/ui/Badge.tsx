import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type BadgeVariant =
  | 'primary'
  | 'development'
  | 'monitoring'
  | 'technical'
  | 'priority-high'
  | 'priority-medium'
  | 'priority-low'
  | 'success'
  | 'surface'

export interface BadgeProps {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary/15 text-primary',
  development: 'bg-surface-container-high text-on-surface',
  monitoring: 'bg-surface-container-high text-secondary',
  technical: 'bg-accent-soft text-teal-action',
  'priority-high': 'bg-error-container text-on-error-container',
  'priority-medium': 'bg-surface-container-high text-secondary',
  'priority-low': 'bg-surface-container-low text-tertiary',
  success: 'text-success-vibrant bg-surface-container-high',
  surface: 'bg-tertiary text-white',
}

export function Badge({
  variant = 'primary',
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-1 text-micro font-medium uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
