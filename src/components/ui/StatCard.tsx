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
        'flex flex-col justify-between bg-surface-container-lowest p-8 transition-colors duration-300 hover:bg-surface-container',
        className,
      )}
    >
      <div>
        <p className="mb-2 text-label-md uppercase text-secondary">{label}</p>
        <h2 className="stat-value font-display text-display-lg leading-none">
          {value}
        </h2>
      </div>
      <div className="mt-10 flex items-center gap-3 border-t border-border-light pt-6">
        <span className="flex items-center gap-1 font-display text-sm text-success-vibrant">
          <TrendingUp className="h-4 w-4" aria-hidden />
          {trendPercent}
        </span>
        <span className="text-body-sm text-secondary">{trendLabel}</span>
      </div>
    </div>
  )
}
