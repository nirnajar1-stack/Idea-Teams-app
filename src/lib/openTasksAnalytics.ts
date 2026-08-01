import type { Idea, IdeaCategory, IdeaPriority, IdeaSource } from '../types/idea'
import {
  CATEGORY_LABELS,
  IDEA_SOURCE_LABELS,
  PRIORITY_LABELS,
  getDaysUntilTarget,
  isActivelyOverdue,
  isRootIdea,
  needsAttentionToday,
} from './ideaUtils'

export interface BreakdownItem {
  key: string
  label: string
  count: number
  percent: number
}

export interface OpenTasksAnalytics {
  totalOpen: number
  /** עבר תאריך יעד (פתוחות בלבד) */
  overdueCount: number
  /** יעד היום או באיחור — דורש טיפול מיידי */
  attentionCount: number
  /** יעד בשבוע הקרוב (לא כולל איחור) */
  dueSoonCount: number
  unlabeledCount: number
  bySource: BreakdownItem[]
  byLabel: BreakdownItem[]
  byPriority: BreakdownItem[]
  byCategory: BreakdownItem[]
  byAge: BreakdownItem[]
}

export function isOpenTask(idea: Idea): boolean {
  return idea.workflowStatus !== 'completed' && isRootIdea(idea)
}

function daysOpen(idea: Idea, today = new Date().toISOString().slice(0, 10)): number {
  const start = idea.createdAt.slice(0, 10)
  const a = new Date(start)
  const b = new Date(today)
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)))
}

function ageBucket(days: number): { key: string; label: string } {
  if (days <= 7) return { key: '0-7', label: 'עד שבוע' }
  if (days <= 30) return { key: '8-30', label: '8–30 יום' }
  if (days <= 90) return { key: '31-90', label: '31–90 יום' }
  return { key: '90+', label: 'מעל 90 יום' }
}

function buildBreakdown(
  entries: Array<{ key: string; label: string }>,
  total: number,
): BreakdownItem[] {
  const counts = new Map<string, { label: string; count: number }>()
  for (const entry of entries) {
    const prev = counts.get(entry.key) ?? { label: entry.label, count: 0 }
    counts.set(entry.key, { label: entry.label, count: prev.count + 1 })
  }

  return [...counts.entries()]
    .map(([key, { label, count }]) => ({
      key,
      label,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function computeOpenTasksAnalytics(
  ideas: Idea[],
  labelNameById: Map<string, string> = new Map(),
): OpenTasksAnalytics {
  const open = ideas.filter(isOpenTask)
  const totalOpen = open.length
  const today = new Date().toISOString().slice(0, 10)

  const bySourceEntries = open.map((i) => ({
    key: i.ideaSource,
    label: IDEA_SOURCE_LABELS[i.ideaSource],
  }))

  const byPriorityEntries = open.map((i) => ({
    key: i.priority,
    label: PRIORITY_LABELS[i.priority],
  }))

  const byCategoryEntries = open.map((i) => ({
    key: i.category,
    label: CATEGORY_LABELS[i.category],
  }))

  const byAgeEntries = open.map((i) => ageBucket(daysOpen(i, today)))

  const byLabelEntries: Array<{ key: string; label: string }> = []
  let unlabeledCount = 0

  for (const idea of open) {
    const labelIds = (idea.tags ?? []).filter((t) => t.startsWith('lbl-'))
    if (labelIds.length === 0) {
      unlabeledCount += 1
      byLabelEntries.push({ key: '__none__', label: 'ללא לייבל' })
      continue
    }
    for (const id of labelIds) {
      byLabelEntries.push({
        key: id,
        label: labelNameById.get(id) ?? id,
      })
    }
  }

  const overdueCount = open.filter(isActivelyOverdue).length
  const attentionCount = open.filter(needsAttentionToday).length
  const dueSoonCount = open.filter((i) => {
    if (!i.targetStartDate || isActivelyOverdue(i)) return false
    const days = getDaysUntilTarget(i.targetStartDate)
    return days >= 1 && days <= 7
  }).length

  return {
    totalOpen,
    overdueCount,
    attentionCount,
    dueSoonCount,
    unlabeledCount,
    bySource: buildBreakdown(bySourceEntries, totalOpen),
    byLabel: buildBreakdown(byLabelEntries, totalOpen),
    byPriority: buildBreakdown(byPriorityEntries, totalOpen),
    byCategory: buildBreakdown(byCategoryEntries, totalOpen),
    byAge: buildBreakdown(byAgeEntries, totalOpen),
  }
}

export type { IdeaCategory, IdeaPriority, IdeaSource }
