import { ArrowLeft, Code, Verified } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import {
  CATEGORY_LABELS,
  formatIdeaDate,
  PRIORITY_LABELS,
} from '../../lib/ideaUtils'
import type { Idea, IdeaPriority } from '../../types/idea'
import { Badge } from '../ui/Badge'
import { InboxBadge } from '../ui/InboxBadge'
import { TargetDateBadge } from '../ui/TargetDateBadge'

export interface IdeaListCardProps {
  idea: Idea
}

const priorityVariant: Record<
  IdeaPriority,
  'priority-high' | 'priority-medium' | 'priority-low'
> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export function IdeaListCard({ idea }: IdeaListCardProps) {
  const CategoryIcon = idea.category === 'development' ? Code : Verified

  return (
    <article className="glass-card-hover group p-6 md:p-7">
      <div className="flex flex-col justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={priorityVariant[idea.priority]}>
              {PRIORITY_LABELS[idea.priority]}
            </Badge>
            <Badge variant="surface" icon={<CategoryIcon className="h-3.5 w-3.5" />}>
              {CATEGORY_LABELS[idea.category]}
            </Badge>
            {idea.sendToMaybeInbox && <InboxBadge />}
            <TargetDateBadge targetStartDate={idea.targetStartDate} compact />
            <span className="mr-auto font-label-sm text-secondary md:mr-0">
              {formatIdeaDate(idea.createdAt)}
            </span>
          </div>
          <h3 className="mb-2 font-display text-headline-md text-on-surface transition-colors group-hover:text-primary">
            {idea.title}
          </h3>
          <p className="mb-6 line-clamp-2 font-body-md text-on-surface-variant">
            {idea.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-primary-fixed to-surface-container-high text-[10px] font-bold text-primary shadow-sm">
                {idea.authorInitials}
              </div>
              <span className="font-label-sm text-secondary">
                נפתח על ידי <span className="text-on-surface">{idea.authorName}</span>
              </span>
            </div>
            <Link
              to={ROUTES.ideaDetail(idea.id)}
              className="flex items-center gap-1 font-label-md text-primary hover:underline decoration-2 underline-offset-4"
            >
              פרטים נוספים
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
