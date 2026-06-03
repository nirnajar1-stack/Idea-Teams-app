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
    <article className="group rounded-2xl border border-border-light bg-surface-container-lowest p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:scale-[1.01]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge variant={priorityVariant[idea.priority]}>
              {PRIORITY_LABELS[idea.priority]}
            </Badge>
            <Badge variant="surface" icon={<CategoryIcon className="h-3.5 w-3.5" />}>
              {CATEGORY_LABELS[idea.category]}
            </Badge>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-high text-[10px] font-bold text-primary">
              {idea.authorInitials}
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
