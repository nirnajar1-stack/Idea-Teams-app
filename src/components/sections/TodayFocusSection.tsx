import { AlertTriangle, ArrowLeft, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import {
  getDaysUntilTarget,
  isActivelyOverdue,
  isRootIdea,
  needsAttentionToday,
} from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'

/** רשימת פעולות לטיפול היום בלוח הבקרה */
export function TodayFocusSection() {
  const { user } = useAuth()
  const { visibleIdeas } = useIdeas()

  const { overdue, dueToday, mineOpen } = useMemo(() => {
    const open = visibleIdeas.filter(
      (i) => isRootIdea(i) && i.workflowStatus !== 'completed' && !i.sendToMaybeInbox,
    )
    const overdueList = open.filter(isActivelyOverdue)
    const dueTodayList = open.filter(
      (i) => needsAttentionToday(i) && !isActivelyOverdue(i),
    )
    const mine = open.filter(
      (i) =>
        i.createdByUserId === user?.id ||
        i.assigneeUserId === user?.id ||
        i.assigneeUserIds?.includes(user?.id ?? ''),
    )
    return {
      overdue: overdueList.slice(0, 5),
      dueToday: dueTodayList.slice(0, 5),
      mineOpen: mine.length,
    }
  }, [visibleIdeas, user?.id])

  const focusItems = [...overdue, ...dueToday].slice(0, 6)
  const overdueTotal = overdue.length
  const dueTodayTotal = dueToday.length

  return (
    <section className="mb-5 md:mb-6" aria-label="לטיפול היום">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="text-right">
          <h2 className="font-display text-headline-md text-on-surface">לטיפול היום</h2>
          <p className="mt-0.5 text-body-sm text-secondary">
            {overdueTotal + dueTodayTotal === 0
              ? 'אין יעדים דחופים כרגע'
              : [
                  overdueTotal > 0 ? `${overdueTotal} באיחור` : null,
                  dueTodayTotal > 0 ? `${dueTodayTotal} ליעד היום` : null,
                  mineOpen > 0 ? `${mineOpen} משויכות אליך` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
          </p>
        </div>
        <Link
          to={ROUTES.openTasksDashboard}
          className="font-label-md text-primary hover:underline"
        >
          כל המשימות הפתוחות
        </Link>
      </div>

      {focusItems.length === 0 ? (
        <div className="rounded-[1.35rem] bg-surface-container-lowest px-4 py-5 text-center shadow-soft">
          <p className="text-body-sm text-secondary">הכול תחת שליטה — אין פריטים לטיפול מיידי.</p>
          <Link
            to={ROUTES.ideas}
            className="mt-3 inline-flex items-center gap-1 font-label-md text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            לרשימת הבקשות
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {focusItems.map((idea) => {
            const overdueItem = isActivelyOverdue(idea)
            const days = getDaysUntilTarget(idea.targetStartDate)
            return (
              <li key={idea.id}>
                <Link
                  to={ROUTES.ideaDetail(idea.id)}
                  className={cn(
                    'glass-card-hover flex items-center gap-3 p-3.5',
                    overdueItem && 'border border-error/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      overdueItem
                        ? 'bg-error/10 text-error'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    {overdueItem ? (
                      <AlertTriangle className="h-4 w-4" aria-hidden />
                    ) : (
                      <Clock3 className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-right">
                    <span className="block truncate font-label-md text-on-surface">
                      {idea.title}
                    </span>
                    <span className="mt-0.5 block text-micro text-secondary">
                      {overdueItem
                        ? `באיחור ${Math.abs(days)} ימים`
                        : 'יעד היום'}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
