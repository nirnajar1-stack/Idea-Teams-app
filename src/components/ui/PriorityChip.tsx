import type { IdeaPriority } from '../../types/idea'
import { useFlashOnChange } from '../../hooks/useFlashOnChange'
import { cn } from '../../lib/cn'
import { PRIORITY_LABELS } from '../../lib/ideaUtils'

export interface PriorityChipProps {
  priority: IdeaPriority
  selected: boolean
  onSelect: () => void
}

export function PriorityChip({ priority, selected, onSelect }: PriorityChipProps) {
  const flash = useFlashOnChange(selected)

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
          'inline-flex min-h-11 min-w-[3.25rem] items-center justify-center rounded-full border px-5 py-2 font-label-md transition-all duration-300',
          selected
            ? 'border-primary bg-primary text-on-primary shadow-boutique scale-[1.02]'
            : 'border-border-light bg-surface-container-lowest text-secondary shadow-soft hover:text-on-surface',
          selected && flash,
        )}
      >
        {PRIORITY_LABELS[priority]}
      </span>
    </label>
  )
}
