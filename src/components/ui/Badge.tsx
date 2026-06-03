import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type BadgeVariant =
  | 'primary'
  | 'development'
  | 'monitoring'
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
  primary: 'bg-primary/10 text-primary',
  development: 'bg-primary/10 text-primary-container',
  monitoring: 'bg-tertiary/10 text-tertiary-container',
  'priority-high': 'bg-error-container text-on-error-container',
  'priority-medium': 'bg-surface-container text-secondary',
  'priority-low': 'bg-surface-container-low text-secondary',
  success: 'bg-success-vibrant/10 text-success-vibrant',
  surface: 'bg-surface-variant text-on-primary-fixed-variant',
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
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
