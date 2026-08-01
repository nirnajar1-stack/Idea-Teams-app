import { Bot, CreditCard, Lightbulb, Shield, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useIdeas } from '../../context/IdeasContext'
import { useQuickAdd } from '../../context/QuickAddContext'
import { ROUTES } from '../../constants/app'
import { loadIdeasViewPrefs } from '../../lib/ideasViewPrefs'
import { CATEGORY_LABELS, formatIdeaDate } from '../../lib/ideaUtils'
import type { Idea } from '../../types/idea'
import { IdeaTableRow } from '../ui/IdeaTableRow'
import { EmptyState } from '../ui/EmptyState'

const iconMap = {
  development: { icon: CreditCard, className: 'bg-primary/10 text-primary' },
  monitoring: { icon: Shield, className: 'bg-tertiary/10 text-tertiary' },
  technical: { icon: Wrench, className: 'bg-accent-soft text-teal-action' },
  ai: { icon: Bot, className: 'bg-primary/10 text-primary' },
} as const

function getRowMeta(idea: Idea) {
  if (idea.department.includes('AI')) return iconMap.ai
  return iconMap[idea.category] ?? iconMap.development
}

export function RecentIdeasSection() {
  const { getRecentIdeas } = useIdeas()
  const { openQuickAdd } = useQuickAdd()
  const sort = loadIdeasViewPrefs().sort
  const recent = getRecentIdeas(3, sort)

  return (
    <section
      className="glass-card mb-0 overflow-hidden animate-fade-up"
      aria-label="בקשות/רעיונות אחרונים"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-3 md:px-5">
        <h3 className="font-display text-label-md text-on-surface md:text-headline-md">
          אחרונים
        </h3>
        <Link
          to={ROUTES.ideas}
          className="shrink-0 font-label-md text-primary transition-colors hover:underline"
        >
          הכל
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="עדיין אין בקשות/רעיונות פעילים"
          description="התחילו ליצור רעיונות חדשים כדי לבנות מומנטום."
          action={
            <button type="button" onClick={openQuickAdd} className="btn-boutique">
              <Lightbulb className="h-4 w-4" />
              הוסף בקשה/רעיון ראשון
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-2.5 font-label-sm text-secondary">שם</th>
                <th className="hidden px-4 py-2.5 font-label-sm text-secondary sm:table-cell">
                  קטגוריה
                </th>
                <th className="hidden px-4 py-2.5 font-label-sm text-secondary lg:table-cell">
                  יוצר
                </th>
                <th className="px-4 py-2.5 font-label-sm text-secondary">סטטוס</th>
                <th className="hidden px-4 py-2.5 font-label-sm text-secondary md:table-cell">
                  יעד
                </th>
                <th className="hidden px-4 py-2.5 font-label-sm text-secondary xl:table-cell">
                  נוצר
                </th>
                <th className="px-4 py-2.5" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {recent.map((idea) => {
                const meta = getRowMeta(idea)
                return (
                  <IdeaTableRow
                    key={idea.id}
                    ideaId={idea.id}
                    title={idea.title}
                    authorName={idea.authorName}
                    targetStartDate={idea.targetStartDate}
                    category={idea.department}
                    status={CATEGORY_LABELS[idea.category]}
                    statusVariant={idea.category}
                    date={formatIdeaDate(idea.createdAt)}
                    icon={meta.icon}
                    iconWrapperClassName={meta.className}
                    compact
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
