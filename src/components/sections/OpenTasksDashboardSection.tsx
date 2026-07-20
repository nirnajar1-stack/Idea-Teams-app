import { Link } from 'react-router-dom'
import { BarChart3, Clock3, Layers3, Tag } from 'lucide-react'
import { ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { useLabels } from '../../context/LabelsContext'
import { computeOpenTasksAnalytics } from '../../lib/openTasksAnalytics'
import { useMemo } from 'react'
import { OpenTasksBreakdownPanel } from '../openTasks/OpenTasksBreakdownPanel'
import { OpenTasksInsightCard } from '../openTasks/OpenTasksInsightCard'
import { OpenTasksMetricTile } from '../openTasks/OpenTasksMetricTile'

export interface OpenTasksDashboardSectionProps {
  showFullViewLink?: boolean
}

export function OpenTasksDashboardSection({ showFullViewLink = true }: OpenTasksDashboardSectionProps) {
  const { visibleIdeas } = useIdeas()
  const { labels } = useLabels()

  const analytics = useMemo(() => {
    const labelMap = new Map(labels.map((l) => [l.id, l.name]))
    return computeOpenTasksAnalytics(visibleIdeas, labelMap)
  }, [visibleIdeas, labels])

  const overdueRate = analytics.totalOpen
    ? Math.round((analytics.overdueCount / analytics.totalOpen) * 100)
    : 0

  return (
    <section className="open-tasks-dashboard" aria-label="דשבורד משימות פתוחות">
      <div className="open-tasks-dashboard__shell">
        <header className="open-tasks-dashboard__header">
          <div className="text-right">
            <span className="section-eyebrow">ניהול תפוקה</span>
            <h2 className="font-display text-headline-md text-on-surface">משימות שלא נסגרו</h2>
            <p className="mt-2 max-w-2xl font-body-md leading-relaxed text-secondary">
              תמונת מצב מרוכזת לזיהוי עומסים, פערי סיווג וצווארי בקבוק — לפי מקור, לייבל,
              חשיבות וותק.
            </p>
          </div>
          {showFullViewLink && (
            <Link
              to={ROUTES.openTasksDashboard}
              className="btn-secondary-light inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              תצוגה מלאה
            </Link>
          )}
        </header>

        <div className="open-tasks-dashboard__kpi-grid">
          <OpenTasksMetricTile
            label="משימות פתוחות"
            value={analytics.totalOpen}
            hint="משימות שטרם הושלמו"
            icon={Layers3}
            tone="neutral"
          />
          <OpenTasksMetricTile
            label="באיחור"
            value={analytics.overdueCount}
            hint={`${overdueRate}% מעבר לתאריך היעד`}
            icon={Clock3}
            tone={overdueRate >= 40 ? 'warning' : 'attention'}
          />
          <OpenTasksMetricTile
            label="ללא לייבל"
            value={analytics.unlabeledCount}
            hint="דורשות סיווג לפילוח מדויק"
            icon={Tag}
            tone={analytics.unlabeledCount > analytics.totalOpen * 0.4 ? 'attention' : 'neutral'}
          />
          <OpenTasksInsightCard analytics={analytics} />
        </div>

        <div className="open-tasks-dashboard__featured-grid">
          <OpenTasksBreakdownPanel
            title="לפי מקור המשימה"
            subtitle="היכן נוצרו הבקשות — לזיהוי עומסים לפי גורם"
            items={analytics.bySource}
            emptyLabel="אין משימות פתוחות"
            maxItems={5}
          />
          <OpenTasksBreakdownPanel
            title="לפי לייבל"
            subtitle="סיווג תפעולי — משימה יכולה לשייך ליותר מלייבל אחד"
            items={analytics.byLabel}
            emptyLabel="אין לייבלים משויכים"
            maxItems={5}
          />
        </div>

        <div className="open-tasks-dashboard__secondary-grid">
          <OpenTasksBreakdownPanel
            title="לפי חשיבות"
            items={analytics.byPriority}
            emptyLabel="—"
            palette="priority"
            compact
            maxItems={3}
          />
          <OpenTasksBreakdownPanel
            title="לפי קטגוריה"
            items={analytics.byCategory}
            emptyLabel="—"
            palette="category"
            compact
            maxItems={3}
          />
          <OpenTasksBreakdownPanel
            title="לפי ותק פתוח"
            subtitle="כמה זמן המשימה פתוחה"
            items={analytics.byAge}
            emptyLabel="—"
            palette="age"
            compact
            maxItems={4}
          />
        </div>
      </div>
    </section>
  )
}
