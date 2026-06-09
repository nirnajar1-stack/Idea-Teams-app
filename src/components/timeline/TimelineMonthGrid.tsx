import { cn } from '../../lib/cn'
import {
  TIMELINE_WEEKDAY_HEADERS,
  dayOfMonth,
  formatTimelineDayLabel,
  timelineDragMime,
  type MonthGrid,
} from '../../lib/timelineUtils'
import type { Idea } from '../../types/idea'
import { TimelineIdeaCard } from './TimelineIdeaCard'

interface TimelineMonthGridProps {
  grid: MonthGrid
  byDate: Map<string, Idea[]>
  assigneeNames: Map<string, string>
  dropTarget: string | null
  onDrop: (ideaId: string, dateKey: string) => void
  onDragOver: (dateKey: string) => void
  onDragLeave: () => void
}

export function TimelineMonthGrid({
  grid,
  byDate,
  assigneeNames,
  dropTarget,
  onDrop,
  onDragOver,
  onDragLeave,
}: TimelineMonthGridProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
        {TIMELINE_WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="py-1 text-center font-label-sm text-secondary sm:font-label-md"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-1 sm:space-y-2">
        {grid.weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week.map((dateKey, di) => {
              if (!dateKey) {
                return (
                  <div
                    key={`empty-${wi}-${di}`}
                    className="min-h-[4.5rem] bg-surface-container-low/30 sm:min-h-[6.5rem]"
                    aria-hidden
                  />
                )
              }

              const ideas = byDate.get(dateKey) ?? []
              const { isToday } = formatTimelineDayLabel(dateKey)
              const isDropTarget = dropTarget === dateKey

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'flex min-h-[4.5rem] flex-col border p-1 transition-colors sm:min-h-[6.5rem] sm:p-1.5',
                    isToday
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border-light bg-surface-container-low/50',
                    isDropTarget && 'border-primary bg-primary/10 ring-2 ring-primary/20',
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    onDragOver(dateKey)
                  }}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => {
                    e.preventDefault()
                    const ideaId = e.dataTransfer.getData(timelineDragMime())
                    if (ideaId) onDrop(ideaId, dateKey)
                  }}
                >
                  <div className="mb-0.5 flex items-center justify-between gap-0.5">
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-label-sm sm:h-7 sm:w-7',
                        isToday
                          ? 'bg-primary font-label-md text-on-primary'
                          : 'text-on-surface',
                      )}
                    >
                      {dayOfMonth(dateKey)}
                    </span>
                    {ideas.length > 0 && (
                      <span className="hidden font-label-sm text-secondary sm:inline">
                        {ideas.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {ideas.slice(0, 2).map((idea) => (
                      <TimelineIdeaCard
                        key={idea.id}
                        idea={idea}
                        compact
                        assigneeName={
                          idea.assigneeUserId
                            ? assigneeNames.get(idea.assigneeUserId)
                            : undefined
                        }
                      />
                    ))}
                    {ideas.length > 2 && (
                      <span className="truncate px-0.5 font-label-sm text-primary">
                        +{ideas.length - 2} נוספים
                      </span>
                    )}
                    {ideas.length === 0 && (
                      <span className="hidden flex-1 items-center justify-center font-label-sm text-secondary/50 sm:flex">
                        ·
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
