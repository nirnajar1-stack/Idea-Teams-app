import type { Idea, IdeaFilters, IdeasStats } from '../types/idea'
import type { UserId } from '../types/user'

export function normalizeIdea(idea: Idea): Idea {
  if (idea.createdByUserId) return idea

  const legacyNir = ['ניר', 'רותם', 'אלון']
  const isNir = legacyNir.some((n) => idea.authorName?.includes(n))
  const userId: UserId = isNir ? 'nir' : 'golan'

  return {
    ...idea,
    createdByUserId: userId,
    authorName: userId === 'nir' ? 'ניר' : 'גולן',
    authorInitials: userId === 'nir' ? 'ניר' : 'גול',
  }
}

export function computeStats(ideas: Idea[]): IdeasStats {
  const total = ideas.length
  const developmentCount = ideas.filter((i) => i.category === 'development').length
  const monitoringCount = ideas.filter((i) => i.category === 'monitoring').length
  const developmentPercent = total ? Math.round((developmentCount / total) * 100) : 0
  const monitoringPercent = total ? Math.round((monitoringCount / total) * 100) : 0

  return {
    total,
    developmentCount,
    monitoringCount,
    developmentPercent,
    monitoringPercent,
    monthGrowthPercent: 12,
  }
}

export function filterIdeas(ideas: Idea[], filters: IdeaFilters): Idea[] {
  const query = filters.search.trim().toLowerCase()

  return ideas.filter((idea) => {
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
