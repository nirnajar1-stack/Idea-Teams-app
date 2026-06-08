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
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function TimelineIdeaCard({
  idea,
  assigneeName,
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
        'group cursor-grab rounded-lg border border-border-light bg-surface-container-lowest p-3 shadow-card transition-shadow active:cursor-grabbing hover:shadow-boutique',
        idea.priority === 'high' && 'border-priority-high/30',
      )}
    >
      <div className="mb-1.5 flex items-start gap-1.5">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-secondary/50 group-hover:text-secondary" />
        <Link
          to={ROUTES.ideaDetail(idea.id)}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 font-label-md leading-snug text-on-surface hover:text-primary"
        >
          {idea.title}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 ps-5 font-label-sm text-secondary">
        <span>#{idea.externalId}</span>
        <span className="text-primary/80">{PRIORITY_LABELS[idea.priority]}</span>
        {assigneeName && <span>· {assigneeName}</span>}
      </div>
    </div>
  )
}
