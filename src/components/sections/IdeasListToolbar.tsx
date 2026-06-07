import { LayoutGrid, LayoutList } from 'lucide-react'
import type { IdeaSortOption } from '../../types/idea'
import { IDEA_SORT_LABELS } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

export interface IdeasListToolbarProps {
  sort: IdeaSortOption
  onSortChange: (sort: IdeaSortOption) => void
  compact: boolean
  onCompactChange: (compact: boolean) => void
  activeCount: number
  completedCount: number
}

export function IdeasListToolbar({
  sort,
  onSortChange,
  compact,
  onCompactChange,
  activeCount,
  completedCount,
}: IdeasListToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border-light bg-surface-container-lowest/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-label-sm text-secondary">
        <span className="rounded-full bg-primary/10 px-3 py-1 font-label-md text-primary">
          {activeCount} פעילים
        </span>
        {completedCount > 0 && (
          <span className="rounded-full bg-success-vibrant/10 px-3 py-1 font-label-md text-success-vibrant">
            {completedCount} הושלמו
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-label-sm text-on-surface">
          <span className="hidden sm:inline text-secondary">מיון</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as IdeaSortOption)}
            className="boutique-input min-w-[11rem] py-2.5 text-label-sm"
            aria-label="מיון רעיונות"
          >
            {(Object.keys(IDEA_SORT_LABELS) as IdeaSortOption[]).map((key) => (
              <option key={key} value={key}>
                {IDEA_SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <div
          className="flex rounded-xl border border-border-light bg-surface-container-low p-0.5"
          role="group"
          aria-label="תצוגה"
        >
          <button
            type="button"
            onClick={() => onCompactChange(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 font-label-sm transition-colors',
              !compact
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface',
            )}
            aria-pressed={!compact}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">רגיל</span>
          </button>
          <button
            type="button"
            onClick={() => onCompactChange(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 font-label-sm transition-colors',
              compact
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface',
            )}
            aria-pressed={compact}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">קומפקטי</span>
          </button>
        </div>
      </div>
    </div>
  )
}
