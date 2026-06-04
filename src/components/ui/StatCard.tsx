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
        'group relative flex flex-col justify-between overflow-hidden glass-card-hover p-8',
        className,
      )}
    >
      <div className="relative z-10">
        <p className="mb-1 font-label-md text-secondary">{label}</p>
        <h2 className="stat-value bg-gradient-to-l from-primary-deep via-primary to-glow bg-clip-text font-display text-display-lg leading-none text-transparent">
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
        className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/15"
        aria-hidden
      />
    </div>
  )
}
