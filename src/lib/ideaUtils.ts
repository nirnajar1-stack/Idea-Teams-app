import type { Idea, IdeaFilters, IdeasStats } from '../types/idea'

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
