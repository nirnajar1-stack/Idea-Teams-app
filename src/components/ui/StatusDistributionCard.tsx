export interface StatusBarItem {
  label: string
  count: number
  percent: number
  barClassName: string
}

import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

export interface StatusDistributionCardProps {
  title: string
  items: StatusBarItem[]
  legend: { label: string; colorClass: string }[]
  className?: string
  style?: CSSProperties
}

export function StatusDistributionCard({
  title,
  items,
  legend,
  className,
  style,
}: StatusDistributionCardProps) {
  return (
    <div className={cn('glass-card-hover p-4 md:p-5', className)} style={style}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-sans text-label-md text-on-surface md:text-headline-md">
          {title}
        </h3>
        <div className="flex flex-wrap gap-3">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cnDot(item.colorClass)} />
              <span className="font-label-sm text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex justify-between">
              <span className="font-label-md text-on-surface">{item.label}</span>
              <span className="font-mono text-sm text-on-surface">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
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
  return `h-2.5 w-2.5 rounded-full ${colorClass}`
}

function cnBar(colorClass: string) {
  return `h-full rounded-full ${colorClass}`
}
