import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { timelineDragMime } from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea, IdeaPriority } from '../../types/idea'

const priorityAccent: Record<IdeaPriority, string> = {
  high: 'timeline-row--priority-high',
  medium: 'timeline-row--priority-medium',
  low: 'timeline-row--priority-low',
}

interface TimelineCompactIdeaRowProps {
  idea: Idea
  variant?: 'backlog' | 'cell'
  onDragStart?: () => void
  onDragEnd?: () => void
  onReturnToBacklog?: (ideaId: string) => void
}

export function TimelineCompactIdeaRow({
  idea,
  variant = 'cell',
  onDragStart,
  onDragEnd,
  onReturnToBacklog,
}: TimelineCompactIdeaRowProps) {
  const isBacklog = variant === 'backlog'
  const showReturn = !isBacklog && onReturnToBacklog

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(timelineDragMime(), idea.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'timeline-row group',
        !isBacklog && priorityAccent[idea.priority],
        isBacklog && 'timeline-row--backlog',
      )}
      title={idea.title}
    >
      <Link
        to={ROUTES.ideaDetail(idea.id)}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'min-w-0 flex-1 truncate text-on-surface transition-colors hover:text-primary',
          isBacklog ? 'font-body-md leading-snug' : 'font-label-sm leading-tight',
        )}
      >
        {idea.title}
      </Link>
      {showReturn && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onReturnToBacklog(idea.id)
          }}
          className="shrink-0 border border-transparent p-0.5 text-secondary opacity-0 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary group-hover:opacity-100 focus:opacity-100"
          aria-label={`החזר ${idea.title} ללא מתוכנן`}
          title="החזר ללא מתוכנן"
        >
          <Inbox className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
