import type { BreakdownItem } from '../../lib/openTasksAnalytics'
import { cn } from '../../lib/cn'
import {
  barColorForItem,
  relativeBarWidth,
} from './openTasksChartTheme'

export interface OpenTasksBreakdownPanelProps {
  title: string
  subtitle?: string
  items: BreakdownItem[]
  emptyLabel: string
  palette?: 'default' | 'priority' | 'category' | 'age'
  compact?: boolean
  maxItems?: number
  className?: string
}

export function OpenTasksBreakdownPanel({
  title,
  subtitle,
  items,
  emptyLabel,
  palette = 'default',
  compact = false,
  maxItems = 6,
  className,
}: OpenTasksBreakdownPanelProps) {
  const visible = items.slice(0, maxItems)
  const maxCount = visible[0]?.count ?? 0
  const overflow = items.length - visible.length

  return (
    <div
      className={cn(
        'flex h-full flex-col border border-border-light bg-surface-container-lowest',
        compact ? 'p-5' : 'p-6 md:p-7',
        className,
      )}
    >
      <header className="mb-5 border-b border-border-light/80 pb-4">
        <h3 className="font-display text-headline-sm text-on-surface">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-body-sm leading-relaxed text-secondary">{subtitle}</p>
        )}
      </header>

      {visible.length === 0 ? (
        <p className="flex flex-1 items-center font-body-md text-secondary">{emptyLabel}</p>
      ) : (
        <ul className={cn('space-y-4', compact && 'space-y-3')}>
          {visible.map((item, index) => {
            const barClass = barColorForItem(item, index, palette)
            const width = relativeBarWidth(item.count, maxCount)

            return (
              <li key={`${item.key}-${item.label}`}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate font-label-md text-on-surface">{item.label}</span>
                  <div className="flex shrink-0 items-baseline gap-2">
                    <span className="font-mono text-sm text-on-surface">{item.count}</span>
                    <span className="text-xs text-secondary">{item.percent}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden bg-surface-container">
                  <div
                    className={cn('h-full transition-[width] duration-500 ease-out', barClass)}
                    style={{ width: `${width}%` }}
                    role="presentation"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {overflow > 0 && (
        <p className="mt-4 text-xs text-secondary">+{overflow} קטגוריות נוספות</p>
      )}
    </div>
  )
}
