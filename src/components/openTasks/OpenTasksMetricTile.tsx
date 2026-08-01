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
}: OpenTasksMetricTileProps) {
  const styles = toneStyles[tone]

  return (
    <article
      className={cn(
        'flex h-full flex-col justify-between rounded-[1.5rem] border p-5 transition-all duration-300 md:p-6',
        styles.shell,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-label-sm text-secondary">{label}</p>
          <p className={cn('mt-2 font-sans text-[2.5rem] font-bold leading-none tracking-tight', styles.value)}>
            {value}
          </p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-5 border-t border-border-light/70 pt-4 text-body-sm leading-relaxed text-secondary">
        {hint}
      </p>
    </article>
  )
}
