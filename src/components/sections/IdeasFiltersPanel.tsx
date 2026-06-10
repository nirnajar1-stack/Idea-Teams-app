import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IDEA_CATEGORIES } from '../ui/CategoryPicker'
import { CATEGORY_LABELS } from '../../lib/ideaUtils'
import type { IdeaCategory, IdeaPriority, IdeaSource } from '../../types/idea'
import { IDEA_SOURCES } from '../../types/idea'
import { IDEA_SOURCE_LABELS } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

export interface IdeasFiltersPanelProps {
  categories: IdeaCategory[]
  onToggleCategory: (cat: IdeaCategory) => void
  sources: IdeaSource[]
  onToggleSource: (source: IdeaSource) => void
  onlyMine: boolean
  onOnlyMineChange: (value: boolean) => void
  priority: IdeaPriority | null
  onPriorityChange: (value: IdeaPriority | null) => void
  userName?: string
  showExecutionFilter?: boolean
  onlyExecution?: boolean
  onOnlyExecutionChange?: (value: boolean) => void
}

export function IdeasFiltersPanel({
  categories,
  onToggleCategory,
  sources,
  onToggleSource,
  onlyMine,
  onOnlyMineChange,
  priority,
  onPriorityChange,
  userName,
  showExecutionFilter = false,
  onlyExecution = false,
  onOnlyExecutionChange,
}: IdeasFiltersPanelProps) {
  const [open, setOpen] = useState(false)

  const activeCount = useMemo(() => {
    let n = 0
    if (categories.length < 2) n += 1
    if (sources.length < IDEA_SOURCES.length) n += 1
    if (onlyMine) n += 1
    if (priority) n += 1
    if (onlyExecution) n += 1
    return n
  }, [categories.length, sources.length, onlyMine, priority, onlyExecution])

  return (
    <div className="sticky top-14 z-20 lg:top-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex w-full items-center justify-between border border-border-light bg-surface-container-lowest px-4 py-3 transition-colors hover:border-primary/25 lg:hidden"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-label-md text-on-surface">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          פילטרים
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-secondary transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div className={cn('space-y-4 lg:space-y-8', open ? 'block' : 'hidden', 'lg:block')}>
        <div className="border border-border-light bg-surface-container-lowest p-4 md:p-6">
          <h3 className="mb-4 font-label-md text-on-surface">קטגוריות</h3>
          <div className="space-y-2">
            {IDEA_CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={cn(
                  'flex cursor-pointer items-center justify-between p-2 transition-colors hover:bg-surface-subtle',
                  !categories.includes(cat) && 'opacity-50',
                )}
              >
                <span className="font-body-md">{CATEGORY_LABELS[cat]}</span>
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="border border-border-light bg-surface-container-lowest p-4 md:p-6">
          <h3 className="mb-4 font-label-md text-on-surface">מקור הבקשה/רעיון</h3>
          <div className="space-y-2">
            {IDEA_SOURCES.map((source) => (
              <label
                key={source}
                className={cn(
                  'flex cursor-pointer items-center justify-between p-2 transition-colors hover:bg-surface-subtle',
                  !sources.includes(source) && 'opacity-50',
                )}
              >
                <span className="font-body-md">{IDEA_SOURCE_LABELS[source]}</span>
                <input
                  type="checkbox"
                  checked={sources.includes(source)}
                  onChange={() => onToggleSource(source)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="border border-border-light bg-surface-container-lowest p-4 md:p-6">
          <h3 className="mb-4 font-label-md text-on-surface">תצוגה</h3>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => onOnlyMineChange(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="font-body-md">רק הבקשות/רעיונות שלי ({userName})</span>
            </label>
            {showExecutionFilter && onOnlyExecutionChange && (
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={onlyExecution}
                  onChange={(e) => onOnlyExecutionChange(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="font-body-md">רק מסומנים לביצוע</span>
              </label>
            )}
          </div>
        </div>

        <div className="border border-border-light bg-surface-container-lowest p-4 md:p-6">
          <h3 className="mb-4 font-label-md text-on-surface">רמת חשיבות</h3>
          <div className="space-y-3">
            {(['high', 'medium', 'low'] as IdeaPriority[]).map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="priority-filter"
                  checked={priority === p}
                  onChange={() => onPriorityChange(priority === p ? null : p)}
                  className="text-primary focus:ring-primary"
                />
                <span className="font-body-md transition-colors hover:text-primary">
                  {p === 'high' ? 'גבוהה' : p === 'medium' ? 'בינונית' : 'נמוכה'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
