import { Ban, CheckCheck, Clock, Loader } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { WORKFLOW_LABELS } from '../../lib/ideaUtils'
import type { IdeaWorkflowStatus } from '../../types/idea'
import { cn } from '../../lib/cn'

const STATUS_UI: Record<
  IdeaWorkflowStatus,
  { icon: LucideIcon; className: string }
> = {
  pending: {
    icon: Clock,
    className: 'bg-surface-container-high text-secondary border-secondary/20',
  },
  in_progress: {
    icon: Loader,
    className: 'bg-primary/10 text-primary border-primary/25',
  },
  completed: {
    icon: CheckCheck,
    className: 'bg-success-vibrant/15 text-success-vibrant border-success-vibrant/30',
  },
  cancelled: {
    icon: Ban,
    className: 'bg-error/10 text-error border-error/25',
  },
}

export interface WorkflowStatusBadgeProps {
  status: IdeaWorkflowStatus
  className?: string
  /** compact = smaller padding for table rows */
  compact?: boolean
  showLabel?: boolean
}

export function WorkflowStatusBadge({
  status,
  className,
  compact = false,
  showLabel = true,
}: WorkflowStatusBadgeProps) {
  const ui = STATUS_UI[status] ?? STATUS_UI.pending
  const Icon = ui.icon
  const label = WORKFLOW_LABELS[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium tracking-wide',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-micro',
        ui.className,
        className,
      )}
      title={label}
      aria-label={`סטטוס: ${label}`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {showLabel && <span>{label}</span>}
    </span>
  )
}
