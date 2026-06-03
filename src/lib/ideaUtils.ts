import type { Idea, IdeaFilters, IdeasStats } from '../types/idea'

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function normalizeIdea(idea: Idea): Idea {
  const legacyNir = ['ניר', 'רותם', 'אלון']
  const isNir = legacyNir.some((n) => idea.authorName?.includes(n))
  const userId = idea.createdByUserId ?? (isNir ? 'nir' : 'golan')

  return {
    ...idea,
    createdByUserId: userId,
    guestSessionId: idea.guestSessionId,
    authorName: idea.authorName || (userId === 'nir' ? 'ניר' : 'גולן'),
    authorInitials: idea.authorInitials || (userId === 'nir' ? 'ניר' : 'גול'),
    targetStartDate: idea.targetStartDate ?? addDays(idea.createdAt, 14),
    sendToMaybeInbox: idea.sendToMaybeInbox ?? false,
  }
}

export function isActiveIdea(idea: Idea): boolean {
  return !idea.sendToMaybeInbox
}

export function computeStats(ideas: Idea[]): IdeasStats {
  const active = ideas.filter(isActiveIdea)
  const inbox = ideas.filter((i) => i.sendToMaybeInbox)
  const developmentCount = active.filter((i) => i.category === 'development').length
  const monitoringCount = active.filter((i) => i.category === 'monitoring').length
  const activeTotal = active.length

  return {
    total: ideas.length,
    activeCount: activeTotal,
    inboxCount: inbox.length,
    developmentCount,
    monitoringCount,
    developmentPercent: activeTotal
      ? Math.round((developmentCount / activeTotal) * 100)
      : 0,
    monitoringPercent: activeTotal
      ? Math.round((monitoringCount / activeTotal) * 100)
      : 0,
    monthGrowthPercent: 12,
  }
}

export function filterIdeas(ideas: Idea[], filters: IdeaFilters): Idea[] {
  const query = filters.search.trim().toLowerCase()
  const pipeline = filters.pipeline ?? 'active'

  return ideas.filter((idea) => {
    if (pipeline === 'active' && idea.sendToMaybeInbox) return false
    if (pipeline === 'inbox' && !idea.sendToMaybeInbox) return false

    if (
      filters.categories.length > 0 &&
      filters.categories.length < 2 &&
      !filters.categories.includes(idea.category)
    ) {
      return false
    }
    if (filters.priority && idea.priority !== filters.priority) {
      return false
    }
    if (
      filters.onlyMine &&
      filters.currentUserId &&
      idea.createdByUserId !== filters.currentUserId
    ) {
      return false
    }
    if (!query) return true

    return (
      idea.title.toLowerCase().includes(query) ||
      idea.description.toLowerCase().includes(query) ||
      idea.department.toLowerCase().includes(query) ||
      idea.authorName.toLowerCase().includes(query) ||
      idea.externalId.toLowerCase().includes(query)
    )
  })
}

export function formatIdeaDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatIdeaDateLong(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export type TargetDateStatus = 'overdue' | 'soon' | 'scheduled'

export function getTargetDateStatus(targetStartDate: string): TargetDateStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetStartDate)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'soon'
  return 'scheduled'
}

export function getDaysUntilTarget(targetStartDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetStartDate)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function generateIdeaId(): string {
  return `if-${Date.now().toString(36)}`
}

export function generateExternalId(): string {
  return `IF-${Math.floor(1000 + Math.random() * 9000)}`
}

export const PRIORITY_LABELS = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה',
} as const

export const CATEGORY_LABELS = {
  development: 'פיתוח',
  monitoring: 'בקרה',
} as const

export const WORKFLOW_LABELS = {
  in_progress: 'בביצוע',
  completed: 'הושלם',
  pending: 'ממתין',
} as const

export const TARGET_STATUS_LABELS: Record<TargetDateStatus, string> = {
  overdue: 'עבר מועד',
  soon: 'מתקרב',
  scheduled: 'מתוכנן',
}
