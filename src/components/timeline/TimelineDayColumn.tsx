import { cn } from '../../lib/cn'
import {
  formatTimelineDayLabel,
  timelineDayHeading,
  timelineDragMime,
} from '../../lib/timelineUtils'
import type { Idea } from '../../types/idea'
import { TimelineIdeaCard } from './TimelineIdeaCard'

interface TimelineDayColumnProps {
  dateKey: string
  ideas: Idea[]
  assigneeNames: Map<string, string>
  isDropTarget: boolean
  onDrop: (ideaId: string, dateKey: string) => void
  onDragOver: (dateKey: string) => void
  onDragLeave: () => void
}

export function TimelineDayColumn({
  dateKey,
  ideas,
  assigneeNames,
  isDropTarget,
  onDrop,
  onDragOver,
  onDragLeave,
}: TimelineDayColumnProps) {
  const { isToday } = formatTimelineDayLabel(dateKey)

  return (
    <div
      className={cn(
        'flex min-h-[320px] w-[min(88vw,240px)] shrink-0 snap-center flex-col border transition-colors sm:min-h-[420px] sm:w-[min(100%,220px)]',
        isToday ? 'lambo-today bg-surface-container-low' : 'border-border-light bg-surface-container-low',
        isDropTarget && 'border-primary bg-surface-container',
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
      <header
        className={cn(
          'sticky top-0 z-10 border-b px-3 py-3 text-center',
          isToday ? 'border-primary bg-surface-container-low' : 'border-border-light bg-surface-container-lowest',
        )}
      >
        <p className="font-label-md text-on-surface">{timelineDayHeading(dateKey)}</p>
        <p className="mt-0.5 font-label-sm text-secondary">
          {ideas.length} בקשות/רעיונות
        </p>
      </header>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {ideas.map((idea) => (
          <TimelineIdeaCard
            key={idea.id}
            idea={idea}
            assigneeName={
              idea.assigneeUserId ? assigneeNames.get(idea.assigneeUserId) : undefined
            }
          />
        ))}
        {ideas.length === 0 && (
          <p className="py-8 text-center font-label-sm text-secondary/70">גרור לכאן</p>
        )}
      </div>
    </div>
  )
}
