import { GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { PRIORITY_LABELS } from '../../lib/ideaUtils'
import { timelineDragMime } from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'

interface TimelineIdeaCardProps {
  idea: Idea
  assigneeName?: string
  compact?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function TimelineIdeaCard({
  idea,
  assigneeName,
  compact = false,
  onDragStart,
  onDragEnd,
}: TimelineIdeaCardProps) {
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
        'group cursor-grab border border-border-light bg-surface-container-lowest transition-colors active:cursor-grabbing hover:border-primary/30',
        compact ? 'p-1' : 'p-3',
        idea.priority === 'high' && 'border-priority-high/30',
      )}
    >
      <div className={cn('flex items-start gap-1', compact ? 'gap-0.5' : 'gap-1.5 mb-1.5')}>
        {!compact && (
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-secondary/50 group-hover:text-secondary" />
        )}
        <Link
          to={ROUTES.ideaDetail(idea.id)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'min-w-0 flex-1 text-on-surface hover:text-primary',
            compact
              ? 'truncate font-label-sm leading-tight'
              : 'font-label-md leading-snug',
          )}
          title={idea.title}
        >
          {idea.title}
        </Link>
      </div>
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 ps-5 font-label-sm text-secondary">
          <span>#{idea.externalId}</span>
          <span className="text-primary/80">{PRIORITY_LABELS[idea.priority]}</span>
          {assigneeName && <span>· {assigneeName}</span>}
        </div>
      )}
    </div>
  )
}
