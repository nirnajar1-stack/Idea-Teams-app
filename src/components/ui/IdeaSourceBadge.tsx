import type { IdeaSource } from '../../types/idea'
import { IDEA_SOURCE_LABELS } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

export interface IdeaSourceBadgeProps {
  source: IdeaSource
  compact?: boolean
  className?: string
}

export function IdeaSourceBadge({ source, compact = false, className }: IdeaSourceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-secondary/20 bg-secondary/5 font-label-sm text-secondary',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1',
        className,
      )}
    >
      {IDEA_SOURCE_LABELS[source]}
    </span>
  )
}
