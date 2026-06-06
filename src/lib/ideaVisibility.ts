import type { IdeaVisibility } from '../types/idea'
import type { AppUser } from '../types/user'

export const IDEA_VISIBILITY_LABELS: Record<IdeaVisibility, string> = {
  team: 'פתוח לכל המשתמשים',
  managers_only: 'מנהלים בלבד',
  master_private: 'פרטי מאסטר (רק אני)',
}

export const IDEA_VISIBILITY_HINTS: Record<IdeaVisibility, string> = {
  team: 'כל המשתמשים והמנהלים יראו את הרעיון',
  managers_only: 'רק מנהלים (ומאסטר) יראו — לא משתמשים רגילים',
  master_private: 'אף אחד לא יראה, כולל מנהלים — עד שתחזיר להרשאות רגילות',
}

export function defaultVisibilityForUser(_user: AppUser): IdeaVisibility {
  return 'team'
}

export function visibilityOptionsForUser(user: AppUser): IdeaVisibility[] {
  if (user.accessLevel === 'master') {
    return ['team', 'managers_only', 'master_private']
  }
  if (user.accessLevel === 'manager') {
    return ['team', 'managers_only']
  }
  return ['team']
}

export function resolveVisibilityOnCreate(
  user: AppUser,
  requested?: IdeaVisibility,
): IdeaVisibility {
  const allowed = visibilityOptionsForUser(user)
  if (requested && allowed.includes(requested)) return requested
  return defaultVisibilityForUser(user)
}

export function canChangeIdeaVisibility(user: AppUser | null, idea: { createdByUserId: string }): boolean {
  if (!user) return false
  if (user.accessLevel === 'manager') return true
  if (user.accessLevel === 'master') return idea.createdByUserId === user.id
  return false
}
