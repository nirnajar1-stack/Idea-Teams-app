import type { IdeaPriority } from '../../types/idea'
import { cn } from '../../lib/cn'
import { PRIORITY_LABELS } from '../../lib/ideaUtils'

export interface PriorityChipProps {
  priority: IdeaPriority
  selected: boolean
  onSelect: () => void
}

const priorityStyles: Record<IdeaPriority, string> = {
  low: 'peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-200',
  medium:
    'peer-checked:bg-amber-50 peer-checked:text-amber-700 peer-checked:border-amber-200',
  high: 'peer-checked:bg-rose-50 peer-checked:text-rose-700 peer-checked:border-rose-200',
}

export function PriorityChip({ priority, selected, onSelect }: PriorityChipProps) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name="priority"
        className="peer sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <span
        className={cn(
          'inline-block rounded-full border border-border-light bg-surface-subtle px-6 py-2 font-label-md text-secondary transition-all hover:bg-surface-container-low',
          priorityStyles[priority],
          selected && priority === 'low' && 'border-blue-200 bg-blue-50 text-blue-700',
          selected &&
            priority === 'medium' &&
            'border-amber-200 bg-amber-50 text-amber-700',
          selected &&
            priority === 'high' &&
            'border-rose-200 bg-rose-50 text-rose-700',
        )}
      >
        {PRIORITY_LABELS[priority]}
      </span>
    </label>
  )
}
