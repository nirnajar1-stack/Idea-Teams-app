import { Layers } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface ContainerBadgeProps {
  subCount?: number
  compact?: boolean
  className?: string
}

export function ContainerBadge({ subCount, compact, className }: ContainerBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/8 font-label-sm text-primary',
        compact ? 'px-2 py-0.5' : 'px-3 py-1',
        className,
      )}
    >
      <Layers className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
      {subCount != null && subCount > 0
        ? `${subCount} תת-רעיונות`
        : 'עם תת-רעיונות'}
    </span>
  )
}
