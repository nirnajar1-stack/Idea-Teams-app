import { IDEAS_VIEW_PREFS_KEY } from '../constants/app'
import type { IdeasViewPrefs, IdeaSortOption } from '../types/idea'

export const DEFAULT_IDEAS_VIEW_PREFS: IdeasViewPrefs = {
  compact: true,
  sort: 'date_desc',
}

export function loadIdeasViewPrefs(): IdeasViewPrefs {
  try {
    const raw = localStorage.getItem(IDEAS_VIEW_PREFS_KEY)
    if (!raw) return DEFAULT_IDEAS_VIEW_PREFS
    const parsed = JSON.parse(raw) as Partial<IdeasViewPrefs>
    const sort: IdeaSortOption =
      parsed.sort === 'priority_desc' || parsed.sort === 'author_asc'
        ? parsed.sort
        : 'date_desc'
    return {
      compact: !!parsed.compact,
      sort,
    }
  } catch {
    return DEFAULT_IDEAS_VIEW_PREFS
  }
}

export function saveIdeasViewPrefs(prefs: IdeasViewPrefs): void {
  localStorage.setItem(IDEAS_VIEW_PREFS_KEY, JSON.stringify(prefs))
}
