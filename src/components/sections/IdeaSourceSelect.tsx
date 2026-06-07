import type { IdeaSource } from '../../types/idea'
import { IDEA_SOURCES } from '../../types/idea'
import { IDEA_SOURCE_LABELS } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

export interface IdeaSourceSelectProps {
  value: IdeaSource
  onChange: (value: IdeaSource) => void
  disabled?: boolean
}

export function IdeaSourceSelect({ value, onChange, disabled = false }: IdeaSourceSelectProps) {
  return (
    <div className="space-y-3">
      <span className="block font-label-md text-secondary">מקור הרעיון</span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {IDEA_SOURCES.map((source) => (
          <label
            key={source}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all',
              disabled && 'cursor-not-allowed opacity-60',
              value === source
                ? 'border-primary/40 bg-primary/5 text-primary'
                : 'border-border-light bg-surface-subtle text-on-surface-variant hover:border-primary/20',
            )}
          >
            <input
              type="radio"
              name="ideaSource"
              value={source}
              checked={value === source}
              disabled={disabled}
              onChange={() => onChange(source)}
              className="text-primary focus:ring-primary"
            />
            <span className="font-label-md">{IDEA_SOURCE_LABELS[source]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
