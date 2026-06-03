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
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border-light bg-surface-container-lowest p-8 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="relative z-10">
        <p className="mb-1 font-label-md text-secondary">{label}</p>
        <h2 className="font-display text-display-lg leading-none text-primary">
          {value}
        </h2>
      </div>
      <div className="relative z-10 mt-8 flex items-center gap-2">
        <span className="flex items-center font-label-md text-success-vibrant">
          <TrendingUp className="h-[18px] w-[18px]" aria-hidden />
          {trendPercent}
        </span>
        <span className="font-label-sm text-secondary">{trendLabel}</span>
      </div>
      <div
        className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10"
        aria-hidden
      />
    </div>
  )
}
