import type {
  Idea,
  IdeaCategory,
  IdeaCheckCadence,
  IdeaFilters,
  IdeaKind,
  IdeasStats,
  IdeaSortOption,
  IdeaSource,
} from '../types/idea'
import { DEFAULT_IDEA_SOURCE, IDEA_SOURCES } from '../types/idea'

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
    sentToExecution: idea.sentToExecution ?? false,
    checkCadence: idea.checkCadence ?? undefined,
    ideaKind: idea.ideaKind ?? (idea.parentId ? 'standard' : 'standard'),
    parentId: idea.parentId,
    visibility: idea.visibility ?? 'team',
    assigneeUserIds:
      idea.assigneeUserIds && idea.assigneeUserIds.length > 0
        ? idea.assigneeUserIds
        : idea.assigneeUserId
          ? [idea.assigneeUserId]
          : [],
    assigneeGroupIds: idea.assigneeGroupIds ?? [],
    assigneeUserId:
      idea.assigneeUserId ??
      (idea.assigneeUserIds && idea.assigneeUserIds.length > 0
        ? idea.assigneeUserIds[0]
        : undefined),
    ideaSource:
      idea.ideaSource && IDEA_SOURCES.includes(idea.ideaSource)
        ? idea.ideaSource
        : DEFAULT_IDEA_SOURCE,
  }
}

export function isContainerIdea(idea: Idea): boolean {
  return idea.ideaKind === 'container'
}

export function isSubIdea(idea: Idea): boolean {
  return !!idea.parentId
}

export function isRootIdea(idea: Idea): boolean {
  return !idea.parentId
}

export function isActiveIdea(idea: Idea): boolean {
  return !idea.sendToMaybeInbox
}

export function isRoutineCheckIdea(idea: Idea): boolean {
  return !!idea.checkCadence
}

export const CHECK_CADENCE_LABELS: Record<IdeaCheckCadence, string> = {
  daily: 'יומי',
  every_3_days: 'כל 3 ימים',
  weekly: 'שבועי',
}

const CHECK_CADENCE_DAYS: Record<IdeaCheckCadence, number> = {
  daily: 1,
  every_3_days: 3,
  weekly: 7,
}

function daysBetweenIso(startIso: string, endIso: string): number {
  const start = new Date(startIso.slice(0, 10))
  const end = new Date(endIso.slice(0, 10))
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** האם הגיע זמן לבדיקה שוטפת חוזרת */
export function isRoutineCheckDue(idea: Idea, today = todayDateKey()): boolean {
  if (!idea.checkCadence || idea.workflowStatus === 'completed') return false
  const anchor = idea.lastCheckedAt ?? idea.createdAt
  return daysBetweenIso(anchor, today) >= CHECK_CADENCE_DAYS[idea.checkCadence]
}

export function computeStats(ideas: Idea[]): IdeasStats {
  const active = ideas.filter(isActiveIdea)
  const inbox = ideas.filter((i) => i.sendToMaybeInbox)
  const developmentCount = active.filter((i) => i.category === 'development').length
  const monitoringCount = active.filter((i) => i.category === 'monitoring').length
  const technicalCount = active.filter((i) => i.category === 'technical').length
  const activeTotal = active.length

  return {
    total: ideas.length,
    activeCount: activeTotal,
    inboxCount: inbox.length,
    developmentCount,
    monitoringCount,
    technicalCount,
    developmentPercent: activeTotal
      ? Math.round((developmentCount / activeTotal) * 100)
      : 0,
    monitoringPercent: activeTotal
      ? Math.round((monitoringCount / activeTotal) * 100)
      : 0,
    technicalPercent: activeTotal
      ? Math.round((technicalCount / activeTotal) * 100)
      : 0,
    monthGrowthPercent: 12,
  }
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 } as const

/** זמן פתיחה משוער — מזהה if-* או תאריך createdAt */
export function getIdeaOpenedAt(idea: Idea): number {
  const match = /^if-([a-z0-9]+)$/i.exec(idea.id)
  if (match) {
    const parsed = parseInt(match[1], 36)
    if (!Number.isNaN(parsed)) return parsed
  }
  const d = new Date(idea.createdAt)
  if (!Number.isNaN(d.getTime())) return d.getTime()
  return 0
}

export function sortIdeas(ideas: Idea[], sort: IdeaSortOption): Idea[] {
  const list = [...ideas]
  switch (sort) {
    case 'priority_desc':
      return list.sort((a, b) => {
        const diff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
        if (diff !== 0) return diff
        return getIdeaOpenedAt(b) - getIdeaOpenedAt(a)
      })
    case 'author_asc':
      return list.sort((a, b) => {
        const byName = a.authorName.localeCompare(b.authorName, 'he')
        if (byName !== 0) return byName
        return getIdeaOpenedAt(b) - getIdeaOpenedAt(a)
      })
    case 'date_desc':
    default:
      return list.sort((a, b) => getIdeaOpenedAt(b) - getIdeaOpenedAt(a))
  }
}

export const IDEA_SORT_LABELS: Record<IdeaSortOption, string> = {
  date_desc: 'תאריך פתיחה (חדש למעלה)',
  priority_desc: 'חשיבות (גבוהה למעלה)',
  author_asc: 'פותח הבקשה/רעיון (א–ת)',
}

export function filterIdeas(ideas: Idea[], filters: IdeaFilters): Idea[] {
  const query = filters.search.trim().toLowerCase()
  const pipeline = filters.pipeline ?? 'active'
  const workflow = filters.workflow ?? 'active'
  const sources = filters.sources ?? IDEA_SOURCES

  return ideas.filter((idea) => {
    if (idea.parentId) return false

    if (pipeline === 'active' && idea.sendToMaybeInbox) return false
    if (pipeline === 'inbox' && !idea.sendToMaybeInbox) return false
    if (filters.onlySentToExecution && !idea.sentToExecution) return false

    if (workflow === 'active' && idea.workflowStatus === 'completed') return false
    if (workflow === 'completed' && idea.workflowStatus !== 'completed') return false

    if (
      filters.categories.length > 0 &&
      filters.categories.length < 2 &&
      !filters.categories.includes(idea.category)
    ) {
      return false
    }
    if (
      sources.length > 0 &&
      sources.length < IDEA_SOURCES.length &&
      !sources.includes(idea.ideaSource)
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
      IDEA_SOURCE_LABELS[idea.ideaSource].toLowerCase().includes(query) ||
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

export type TargetDateStatus = 'overdue' | 'soon' | 'scheduled' | 'done'

export function getTargetDateStatus(
  targetStartDate: string,
  options?: { workflowStatus?: Idea['workflowStatus'] },
): TargetDateStatus {
  if (options?.workflowStatus === 'completed') return 'done'

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

/** איחור פעיל — רק משימות שלא הושלמו עם יעד שעבר */
export function isActivelyOverdue(idea: Pick<Idea, 'targetStartDate' | 'workflowStatus'>): boolean {
  if (idea.workflowStatus === 'completed' || !idea.targetStartDate) return false
  return getTargetDateStatus(idea.targetStartDate) === 'overdue'
}

/** דורש תשומת לב היום: באיחור או יעד היום */
export function needsAttentionToday(
  idea: Pick<Idea, 'targetStartDate' | 'workflowStatus'>,
): boolean {
  if (idea.workflowStatus === 'completed' || !idea.targetStartDate) return false
  const days = getDaysUntilTarget(idea.targetStartDate)
  return days <= 0
}

export function generateIdeaId(): string {
  return `if-${Date.now().toString(36)}`
}

export function generateExternalId(): string {
  return `IF-${Date.now().toString(36).toUpperCase()}`
}

export const PRIORITY_LABELS = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה',
} as const

export const CATEGORY_LABELS = {
  development: 'פיתוח',
  monitoring: 'בקרה',
  technical: 'טכני',
} as const satisfies Record<IdeaCategory, string>

export function categoryDepartment(category: IdeaCategory): string {
  return CATEGORY_LABELS[category]
}

export const IDEA_SOURCE_LABELS: Record<IdeaSource, string> = {
  mitamim: 'מתמים',
  families_division: 'אגף משפחות',
  headquarters: 'מטה',
  services: 'מענים',
  government_offices: 'משרדי ממשלה',
}

export const IDEA_KIND_LABELS: Record<IdeaKind, string> = {
  standard: 'בקשה/רעיון',
  container: 'בקשה/רעיון עם תת-בקשות/רעיונות',
}

export function containerProgress(subIdeas: Idea[]): {
  percent: number
  stepLabel: string
} {
  if (subIdeas.length === 0) {
    return { percent: 0, stepLabel: 'אין תת-בקשות/רעיונות עדיין' }
  }
  const avg = Math.round(
    subIdeas.reduce((s, i) => s + i.progress, 0) / subIdeas.length,
  )
  const done = subIdeas.filter((i) => i.workflowStatus === 'completed').length
  return {
    percent: avg,
    stepLabel: `${done} מתוך ${subIdeas.length} תת-בקשות/רעיונות הושלמו`,
  }
}

export const WORKFLOW_LABELS = {
  in_progress: 'בביצוע',
  completed: 'הושלם',
  pending: 'ממתין',
} as const

export const TARGET_STATUS_LABELS: Record<TargetDateStatus, string> = {
  overdue: 'עבר מועד',
  soon: 'מתקרב',
  scheduled: 'מתוכנן',
  done: 'הושלם',
}
