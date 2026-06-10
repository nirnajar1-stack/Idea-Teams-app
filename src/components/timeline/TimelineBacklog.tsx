import { Inbox } from 'lucide-react'
import type { DragEvent } from 'react'
import { cn } from '../../lib/cn'
import { timelineDragMime } from '../../lib/timelineUtils'
import type { Idea } from '../../types/idea'
import { TimelineCompactIdeaRow } from './TimelineCompactIdeaRow'

interface TimelineBacklogProps {
  backlog: Idea[]
  isDropTarget: boolean
  onDropBacklog: (ideaId: string) => void
  onDragOver: () => void
  onDragLeave: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export function TimelineBacklog({
  backlog,
  isDropTarget,
  onDropBacklog,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
}: TimelineBacklogProps) {
  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      onDragOver()
    },
    onDragLeave,
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      const ideaId = e.dataTransfer.getData(timelineDragMime())
      if (ideaId) onDropBacklog(ideaId)
    },
  }

  return (
    <section
      className={cn(
        'timeline-backlog flex flex-col',
        isDropTarget && 'timeline-backlog--drop',
      )}
      {...dropHandlers}
    >
      <header className="timeline-backlog__head">
        <Inbox className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="font-display text-headline-md text-on-surface">לא מתוכנן</h2>
        <span className="timeline-backlog__count">{backlog.length}</span>
      </header>
      <p className="timeline-backlog__hint">
        גרור לכאן ממשימות צפות, מיום בלוח, או החוצה לימים / צף.
      </p>
      <div className="timeline-backlog__list">
        {backlog.map((idea) => (
          <TimelineCompactIdeaRow
            key={idea.id}
            idea={idea}
            variant="backlog"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {backlog.length === 0 && (
          <p className="timeline-backlog__empty">הכל מתוכנן — אין משימות ממתינות.</p>
        )}
      </div>
    </section>
  )
}
