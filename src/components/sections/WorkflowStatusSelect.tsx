import { CheckCheck, Clock, Loader } from 'lucide-react'
import { WORKFLOW_LABELS } from '../../lib/ideaUtils'
import type { IdeaWorkflowStatus } from '../../types/idea'
import { cn } from '../../lib/cn'

const OPTIONS: {
  value: IdeaWorkflowStatus
  icon: typeof Clock
  color: string
}[] = [
  { value: 'pending', icon: Clock, color: 'border-secondary/30 text-secondary' },
  { value: 'in_progress', icon: Loader, color: 'border-primary/30 text-primary' },
  { value: 'completed', icon: CheckCheck, color: 'border-success-vibrant/30 text-success-vibrant' },
]

export interface WorkflowStatusSelectProps {
  value: IdeaWorkflowStatus
  disabled?: boolean
  onChange: (status: IdeaWorkflowStatus) => void
}

export function WorkflowStatusSelect({
  value,
  disabled = false,
  onChange,
}: WorkflowStatusSelectProps) {
  return (
    <div className="space-y-2">
      <span className="block font-label-md text-secondary">סטטוס בקשה/רעיון</span>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value: opt, icon: Icon, color }) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={cn(
              'flex flex-col items-center gap-1 border py-3 font-label-sm transition-colors disabled:opacity-50',
              value === opt
                ? `${color} bg-current/5 ring-2 ring-current/20`
                : 'border-border-light text-on-surface-variant hover:border-primary/20',
            )}
          >
            <Icon className="h-4 w-4" />
            {WORKFLOW_LABELS[opt]}
          </button>
        ))}
      </div>
    </div>
  )
}
