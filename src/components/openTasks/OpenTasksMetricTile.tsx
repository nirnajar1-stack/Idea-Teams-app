import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface OpenTasksMetricTileProps {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone?: 'neutral' | 'warning' | 'attention' | 'insight'
  className?: string
}

const toneStyles = {
  neutral: {
    shell: 'border-transparent bg-surface-container-lowest shadow-card',
    icon: 'bg-primary/10 text-primary',
    value: 'text-on-surface',
  },
  warning: {
    shell: 'border-transparent bg-error/5 shadow-card',
    icon: 'bg-error/10 text-error',
    value: 'text-error',
  },
  attention: {
    shell: 'border-transparent bg-surface-container shadow-card',
    icon: 'bg-surface-container-high text-on-surface',
    value: 'text-on-surface',
  },
  insight: {
    shell: 'border-transparent bg-primary/5 shadow-card',
    icon: 'bg-primary/10 text-primary',
    value: 'text-on-surface',
  },
} as const

export function OpenTasksMetricTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  className,
  compact = false,
}: OpenTasksMetricTileProps & { compact?: boolean }) {
  const styles = toneStyles[tone]

  return (
    <article
      className={cn(
        'flex h-full flex-col justify-between rounded-[1.35rem] border transition-all duration-300',
        compact ? 'p-3.5 md:p-4' : 'rounded-[1.5rem] p-5 md:p-6',
        styles.shell,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label-sm text-secondary">{label}</p>
          <p
            className={cn(
              'mt-1.5 font-sans font-bold leading-none tracking-tight',
              compact ? 'text-[1.75rem]' : 'mt-2 text-[2.5rem]',
              styles.value,
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full',
            compact ? 'h-8 w-8' : 'h-10 w-10',
            styles.icon,
          )}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
      </div>
      <p
        className={cn(
          'border-t border-border-light/70 text-body-sm leading-relaxed text-secondary',
          compact ? 'mt-3 pt-2.5' : 'mt-5 pt-4',
        )}
      >
        {hint}
      </p>
    </article>
  )
}
