export interface StatusBarItem {
  label: string
  count: number
  percent: number
  barClassName: string
}

import { cn } from '../../lib/cn'

export interface StatusDistributionCardProps {
  title: string
  items: StatusBarItem[]
  legend: { label: string; colorClass: string }[]
  className?: string
}

export function StatusDistributionCard({
  title,
  items,
  legend,
  className,
}: StatusDistributionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-light bg-surface-container-lowest p-8 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-display text-headline-md text-on-surface">{title}</h3>
        <div className="flex gap-4">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cnDot(item.colorClass)} />
              <span className="font-label-sm text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between">
              <span className="font-label-md text-on-surface">{item.label}</span>
              <span className="font-label-md font-bold text-on-surface">
                {item.count}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={cnBar(item.barClassName)}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function cnDot(colorClass: string) {
  return `h-3 w-3 rounded-full ${colorClass}`
}

function cnBar(colorClass: string) {
  return `h-full rounded-full ${colorClass}`
}
