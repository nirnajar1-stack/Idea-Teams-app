import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { IDEA_SOURCE_LABELS, PRIORITY_LABELS } from '../../lib/ideaUtils'
import { useMemo } from 'react'

export function OpenTasksHighPriorityList() {
  const { getFilteredIdeas } = useIdeas()

  const highPriorityOpen = useMemo(
    () =>
      getFilteredIdeas({
        search: '',
        categories: [],
        priority: 'high',
        pipeline: 'all',
        workflow: 'active',
      }).slice(0, 8),
    [getFilteredIdeas],
  )

  if (highPriorityOpen.length === 0) return null

  return (
    <section className="open-tasks-dashboard__priority-list" aria-label="משימות בעדיפות גבוהה">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-error/10 text-error">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-headline-sm text-on-surface">
              משימות פתוחות בעדיפות גבוהה
            </h2>
            <p className="mt-0.5 text-body-sm text-secondary">
              {highPriorityOpen.length} משימות דורשות תשומת לב מיידית
            </p>
          </div>
        </div>
      </header>

      <ul className="divide-y divide-border-light border border-border-light bg-surface-container-lowest">
        {highPriorityOpen.map((idea) => (
          <li key={idea.id}>
            <Link
              to={ROUTES.ideaDetail(idea.id)}
              className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low md:px-5"
            >
              <span className="min-w-0 flex-1 font-label-md text-on-surface transition-colors group-hover:text-primary">
                {idea.title}
              </span>
              <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                <span className="border border-error/25 bg-error/8 px-2 py-1 text-error">
                  {PRIORITY_LABELS[idea.priority]}
                </span>
                <span className="border border-border-light bg-surface-subtle px-2 py-1 text-secondary">
                  {IDEA_SOURCE_LABELS[idea.ideaSource]}
                </span>
                <ArrowLeft className="h-3.5 w-3.5 text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
