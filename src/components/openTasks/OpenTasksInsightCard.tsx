import { Lightbulb } from 'lucide-react'
import type { OpenTasksAnalytics } from '../../lib/openTasksAnalytics'

export function buildOpenTasksInsight(analytics: OpenTasksAnalytics): string {
  if (analytics.totalOpen === 0) return 'אין משימות פתוחות — מצוין לתפוקה נקייה.'

  const overdueRate = Math.round((analytics.overdueCount / analytics.totalOpen) * 100)
  const attentionRate = Math.round((analytics.attentionCount / analytics.totalOpen) * 100)
  const unlabeledRate = Math.round((analytics.unlabeledCount / analytics.totalOpen) * 100)

  if (analytics.attentionCount > 0 && attentionRate <= 35) {
    return `${analytics.attentionCount} משימות דורשות טיפול היום (יעד היום או באיחור) — התחילו מהן.`
  }
  if (overdueRate >= 40) {
    return `${analytics.overdueCount} משימות עברו את תאריך היעד (${overdueRate}%). עדכנו תאריכים או סגרו פריטים שכבר לא רלוונטיים.`
  }
  if (analytics.dueSoonCount > 0) {
    return `${analytics.dueSoonCount} משימות עם יעד בשבוע הקרוב — כדאי לתכנן עומס מראש.`
  }
  if (unlabeledRate >= 40) {
    return `${unlabeledRate}% מהמשימות ללא לייבל — סיווג יאפשר פילוח ומעקב מדויק יותר.`
  }
  if (analytics.byPriority[0]) {
    return `${analytics.byPriority[0].percent}% מהמשימות הפתוחות הן בעדיפות ${analytics.byPriority[0].label}.`
  }
  return 'המשך מעקב שבועי אחר משימות פתוחות ימנע הצטברות עומס.'
}

export function OpenTasksInsightCard({
  analytics,
  compact = false,
}: {
  analytics: OpenTasksAnalytics
  compact?: boolean
}) {
  return (
    <aside
      className={
        compact
          ? 'flex h-full flex-col justify-between rounded-[1.35rem] border border-primary/15 bg-surface-container-lowest p-3.5 md:p-4'
          : 'flex h-full flex-col justify-between border border-primary/15 bg-surface-container-lowest p-5 md:p-6'
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            compact
              ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary'
              : 'flex h-10 w-10 shrink-0 items-center justify-center bg-primary/12 text-primary'
          }
        >
          <Lightbulb className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </div>
        <div>
          <p className="font-label-md text-on-surface">תובנה תפעולית</p>
          <p className="mt-1.5 text-body-sm leading-snug text-on-surface-variant md:leading-relaxed">
            {buildOpenTasksInsight(analytics)}
          </p>
        </div>
      </div>
      <p
        className={
          compact
            ? 'mt-3 border-t border-border-light pt-2.5 text-xs text-secondary'
            : 'mt-5 border-t border-border-light pt-4 text-xs text-secondary'
        }
      >
        מבוסס על {analytics.totalOpen} משימות פתוחות
        {analytics.attentionCount > 0
          ? ` · ${analytics.attentionCount} לטיפול מיידי`
          : ''}
      </p>
    </aside>
  )
}
