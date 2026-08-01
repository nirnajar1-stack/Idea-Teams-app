import { TrendingUp } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface StatCardProps {
  label: string
  value: string | number
  trendLabel: string
  trendPercent: string
  className?: string
}

export function StatCard({
  label,
  value,
  trendLabel,
  trendPercent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card-hover flex flex-col justify-between p-4 md:p-5',
        className,
      )}
    >
      <div>
        <p className="mb-1 text-label-sm uppercase text-secondary">{label}</p>
        <h2 className="stat-value font-display text-[2rem] leading-none md:text-display-lg">
          {value}
        </h2>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border-light pt-3">
        <span className="flex items-center gap-1 font-display text-sm text-success-vibrant">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {trendPercent}
        </span>
        <span className="text-body-sm text-secondary">{trendLabel}</span>
      </div>
    </div>
  )
}
