import { cn } from '../../lib/cn'
import {
  formatTimelineDayLabel,
  timelineDayHeading,
  timelineDragMime,
} from '../../lib/timelineUtils'
import type { Idea } from '../../types/idea'
import { TimelineCompactIdeaRow } from './TimelineCompactIdeaRow'

interface TimelineDayColumnProps {
  dateKey: string
  ideas: Idea[]
  isDropTarget: boolean
  onDrop: (ideaId: string, dateKey: string) => void
  onDragOver: (dateKey: string) => void
  onDragLeave: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onReturnToBacklog?: (ideaId: string) => void
}

export function TimelineDayColumn({
  dateKey,
  ideas,
  isDropTarget,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
  onReturnToBacklog,
}: TimelineDayColumnProps) {
  const { isToday } = formatTimelineDayLabel(dateKey)
  const heading = timelineDayHeading(dateKey, true)
  const weekday = formatTimelineDayLabel(dateKey).weekday.slice(0, 2)

  return (
    <div
      className={cn(
        'timeline-day flex min-h-[5.5rem] min-w-0 flex-col sm:aspect-square sm:min-h-[6.5rem]',
        isToday && 'timeline-day--today',
        isDropTarget && 'timeline-day--drop',
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
      <header className="timeline-day__head">
        <span className="timeline-day__weekday">{weekday}</span>
        <span className={cn('timeline-day__date', isToday && 'text-primary')}>
          {heading}
        </span>
        {ideas.length > 0 && (
          <span className="timeline-day__count">{ideas.length}</span>
        )}
      </header>
      <div className="timeline-day__body">
        {ideas.map((idea) => (
          <TimelineCompactIdeaRow
            key={idea.id}
            idea={idea}
            variant="cell"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onReturnToBacklog={onReturnToBacklog}
          />
        ))}
        {ideas.length === 0 && (
          <span className="timeline-day__placeholder">גרור לכאן</span>
        )}
      </div>
    </div>
  )
}
