import { Bot, CreditCard, Lightbulb, Shield, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useIdeas } from '../../context/IdeasContext'
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
  const sort = loadIdeasViewPrefs().sort
  const recent = getRecentIdeas(3, sort)

  return (
    <section className="glass-card overflow-hidden animate-fade-up" aria-label="בקשות/רעיונות אחרונים">
      <div className="flex items-center justify-between border-b border-border-light p-6 md:p-8">
        <h3 className="font-display text-headline-md text-on-surface">
          בקשות/רעיונות אחרונים
        </h3>
        <Link
          to={ROUTES.ideas}
          className="font-label-md text-primary transition-colors hover:underline"
        >
          צפה בכל הבקשות/רעיונות
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="עדיין אין בקשות/רעיונות פעילים"
          description="התחילו ליצור רעיונות חדשים כדי לבנות מומנטום."
          action={
            <Link to={ROUTES.addIdea} className="btn-boutique">
              <Lightbulb className="h-4 w-4" />
              הוסף בקשה/רעיון ראשון
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="px-4 py-4 font-label-md text-secondary md:px-8">
                  שם הבקשה/רעיון
                </th>
                <th className="hidden px-8 py-4 font-label-md text-secondary sm:table-cell">
                  קטגוריה
                </th>
                <th className="hidden px-8 py-4 font-label-md text-secondary lg:table-cell">
                  יוצר
                </th>
                <th className="px-4 py-4 font-label-md text-secondary md:px-8">
                  סטטוס
                </th>
                <th className="hidden px-8 py-4 font-label-md text-secondary md:table-cell">
                  יעד התחלה
                </th>
                <th className="hidden px-8 py-4 font-label-md text-secondary xl:table-cell">
                  נוצר
                </th>
                <th className="px-4 py-4 md:px-8" aria-hidden />
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
