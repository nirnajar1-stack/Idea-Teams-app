import { CalendarClock } from 'lucide-react'
import {
  formatIdeaDate,
  getDaysUntilTarget,
  getTargetDateStatus,
  TARGET_STATUS_LABELS,
} from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

export interface TargetDateBadgeProps {
  targetStartDate: string
  compact?: boolean
}

const statusStyles = {
  overdue: 'border-error/30 bg-error-container/80 text-on-error-container',
  soon: 'border-accent/40 bg-accent-soft text-primary-deep',
  scheduled: 'border-primary/20 bg-primary/5 text-primary',
}

export function TargetDateBadge({ targetStartDate, compact }: TargetDateBadgeProps) {
  const status = getTargetDateStatus(targetStartDate)
  const days = getDaysUntilTarget(targetStartDate)

  const daysLabel =
    days < 0
      ? `${Math.abs(days)} ימים באיחור`
      : days === 0
        ? 'היום'
        : `עוד ${days} ימים`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-label-sm',
        statusStyles[status],
        compact ? 'px-2.5 py-1' : 'px-3 py-1.5',
      )}
      title={`יעד התחלה: ${formatIdeaDate(targetStartDate)}`}
    >
      <CalendarClock className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden />
      <span>{formatIdeaDate(targetStartDate)}</span>
      {!compact && (
        <span className="opacity-80">· {TARGET_STATUS_LABELS[status]} · {daysLabel}</span>
      )}
    </span>
  )
}
