import { CalendarClock } from 'lucide-react'
import {
  formatIdeaDate,
  getDaysUntilTarget,
  getTargetDateStatus,
  TARGET_STATUS_LABELS,
} from '../../lib/ideaUtils'
import type { IdeaWorkflowStatus } from '../../types/idea'
import { cn } from '../../lib/cn'

export interface TargetDateBadgeProps {
  targetStartDate: string
  workflowStatus?: IdeaWorkflowStatus
  compact?: boolean
}

const statusStyles = {
  overdue: 'border-error/30 bg-error-container/80 text-on-error-container',
  soon: 'border-accent/40 bg-accent-soft text-primary-deep',
  scheduled: 'border-primary/20 bg-primary/5 text-primary',
  done: 'border-border-light bg-surface-container-low text-secondary',
}

export function TargetDateBadge({
  targetStartDate,
  workflowStatus,
  compact,
}: TargetDateBadgeProps) {
  const status = getTargetDateStatus(targetStartDate, { workflowStatus })
  const days = getDaysUntilTarget(targetStartDate)

  const daysLabel =
    status === 'done'
      ? TARGET_STATUS_LABELS.done
      : days < 0
        ? `${Math.abs(days)} ימים באיחור`
        : days === 0
          ? 'היום'
          : `עוד ${days} ימים`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-label-sm transition-[color,background-color,border-color] duration-300',
        statusStyles[status],
        compact ? 'px-2.5 py-1' : 'px-3 py-1.5',
      )}
      title={`יעד התחלה: ${formatIdeaDate(targetStartDate)}`}
    >
      <CalendarClock className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} aria-hidden />
      <span>{formatIdeaDate(targetStartDate)}</span>
      {!compact && (
        <span className="opacity-80">
          · {TARGET_STATUS_LABELS[status]}
          {status !== 'done' ? ` · ${daysLabel}` : ''}
        </span>
      )}
    </span>
  )
}
