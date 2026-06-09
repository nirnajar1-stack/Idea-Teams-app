import { ArrowLeft, CirclePlus, GitBranch } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import {
  CATEGORY_LABELS,
  formatIdeaDate,
  PRIORITY_LABELS,
  WORKFLOW_LABELS,
} from '../../lib/ideaUtils'
import type { Idea } from '../../types/idea'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { cn } from '../../lib/cn'

export interface SubIdeasSectionProps {
  parent: Idea
  subIdeas: Idea[]
  canAdd: boolean
}

export function SubIdeasSection({ parent, subIdeas, canAdd }: SubIdeasSectionProps) {
  const navigate = useNavigate()

  return (
    <section className="glass-card p-6 md:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center bg-primary/10">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-headline-md text-on-surface">תת-בקשות/רעיונות</h2>
            <p className="font-label-sm text-secondary">
              {subIdeas.length === 0
                ? 'טרם נוספו תת-בקשות/רעיונות למארז זה'
                : `${subIdeas.length} בקשות/רעיונות במארז`}
            </p>
          </div>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.addSubIdea(parent.id))}
            className="btn-boutique inline-flex items-center gap-2"
          >
            <CirclePlus className="h-5 w-5" />
            תת-בקשה/רעיון חדש
          </button>
        )}
      </div>

      <div className="mb-8">
        <ProgressBar
          percent={parent.progress}
          label={`${parent.progress}% התקדמות מארז`}
          stepLabel={parent.progressStep}
        />
      </div>

      {subIdeas.length === 0 ? (
        <p className="border border-dashed border-border-light bg-surface-subtle/80 p-8 text-center font-body-md text-secondary">
          הוסיפו תת-בקשות/רעיונות כדי לפרק את המארז לשלבים ברורים.
        </p>
      ) : (
        <ul className="space-y-3">
          {subIdeas.map((sub) => (
            <li key={sub.id}>
              <Link
                to={ROUTES.ideaDetail(sub.id)}
                className={cn(
                  'block border border-border-light bg-surface-container-low/80 p-4 transition-colors',
                  'hover:border-primary/30 hover:bg-surface-container',
                )}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="surface">{CATEGORY_LABELS[sub.category]}</Badge>
                  <Badge variant="priority-medium">{PRIORITY_LABELS[sub.priority]}</Badge>
                  <span className="font-label-sm text-secondary">
                    {WORKFLOW_LABELS[sub.workflowStatus]}
                  </span>
                  <span className="mr-auto font-label-sm text-secondary">
                    {formatIdeaDate(sub.createdAt)}
                  </span>
                </div>
                <h3 className="mb-1 font-label-md text-on-surface">{sub.title}</h3>
                <p className="mb-3 line-clamp-2 font-body-md text-on-surface-variant">
                  {sub.description}
                </p>
                <span className="inline-flex items-center gap-1 font-label-md text-primary">
                  פרטי תת-בקשה/רעיון
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
