import { IDEAS_FILTERS_KEY } from '../constants/app'
import type { IdeaCategory, IdeaPriority, IdeaSource } from '../types/idea'
import { IDEA_SOURCES } from '../types/idea'

const ALL_CATEGORIES: IdeaCategory[] = ['development', 'monitoring', 'technical']

export interface IdeasFiltersPrefs {
  categories: IdeaCategory[]
  sources: IdeaSource[]
  priority: IdeaPriority | null
  onlyMine: boolean
  onlyExecution: boolean
}

export const DEFAULT_IDEAS_FILTERS: IdeasFiltersPrefs = {
  categories: [...ALL_CATEGORIES],
  sources: [...IDEA_SOURCES],
  priority: null,
  onlyMine: false,
  onlyExecution: false,
}

function isIdeaCategory(v: unknown): v is IdeaCategory {
  return v === 'development' || v === 'monitoring' || v === 'technical'
}

function isIdeaSource(v: unknown): v is IdeaSource {
  return (IDEA_SOURCES as string[]).includes(v as string)
}

function isPriority(v: unknown): v is IdeaPriority {
  return v === 'low' || v === 'medium' || v === 'high'
}

export function loadIdeasFiltersPrefs(): IdeasFiltersPrefs {
  try {
    const raw = localStorage.getItem(IDEAS_FILTERS_KEY)
    if (!raw) {
      return {
        ...DEFAULT_IDEAS_FILTERS,
        categories: [...ALL_CATEGORIES],
        sources: [...IDEA_SOURCES],
      }
    }
    const parsed = JSON.parse(raw) as Partial<IdeasFiltersPrefs>
    const categories = Array.isArray(parsed.categories)
      ? parsed.categories.filter(isIdeaCategory)
      : [...ALL_CATEGORIES]
    const sources = Array.isArray(parsed.sources)
      ? parsed.sources.filter(isIdeaSource)
      : [...IDEA_SOURCES]
    return {
      categories: categories.length ? categories : [...ALL_CATEGORIES],
      sources: sources.length ? sources : [...IDEA_SOURCES],
      priority: isPriority(parsed.priority) ? parsed.priority : null,
      onlyMine: !!parsed.onlyMine,
      onlyExecution: !!parsed.onlyExecution,
    }
  } catch {
    return {
      ...DEFAULT_IDEAS_FILTERS,
      categories: [...ALL_CATEGORIES],
      sources: [...IDEA_SOURCES],
    }
  }
}

export function saveIdeasFiltersPrefs(prefs: IdeasFiltersPrefs): void {
  localStorage.setItem(IDEAS_FILTERS_KEY, JSON.stringify(prefs))
}

export function isDefaultFilters(prefs: IdeasFiltersPrefs): boolean {
  return (
    prefs.categories.length === ALL_CATEGORIES.length &&
    ALL_CATEGORIES.every((c) => prefs.categories.includes(c)) &&
    prefs.sources.length === IDEA_SOURCES.length &&
    IDEA_SOURCES.every((s) => prefs.sources.includes(s)) &&
    prefs.priority === null &&
    !prefs.onlyMine &&
    !prefs.onlyExecution
  )
}
