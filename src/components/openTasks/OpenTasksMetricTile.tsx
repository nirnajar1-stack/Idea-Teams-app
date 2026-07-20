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
    shell: 'border-border-light bg-surface-container-lowest',
    icon: 'bg-primary/10 text-primary',
    value: 'text-on-surface',
  },
  warning: {
    shell: 'border-error/20 bg-error/5',
    icon: 'bg-error/10 text-error',
    value: 'text-error',
  },
  attention: {
    shell: 'border-tertiary-fixed/30 bg-tertiary-fixed/10',
    icon: 'bg-tertiary-fixed/20 text-on-tertiary-fixed',
    value: 'text-on-surface',
  },
  insight: {
    shell: 'border-primary/20 bg-primary/5',
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
}: OpenTasksMetricTileProps) {
  const styles = toneStyles[tone]

  return (
    <article
      className={cn(
        'flex h-full flex-col justify-between border p-5 transition-colors duration-300 md:p-6',
        styles.shell,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label-sm text-secondary">{label}</p>
          <p className={cn('mt-2 font-display text-[2.5rem] leading-none tracking-tight', styles.value)}>
            {value}
          </p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center', styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-5 border-t border-border-light/70 pt-4 text-body-sm leading-relaxed text-secondary">
        {hint}
      </p>
    </article>
  )
}
