import type { Idea } from '../types/idea'
import type { AppUser, StoredUser } from '../types/user'

export function isMaster(user: AppUser | null): boolean {
  return user?.accessLevel === 'master'
}

export function isManager(user: AppUser | null): boolean {
  return user?.accessLevel === 'manager'
}

export function isManagerOrMaster(user: AppUser | null): boolean {
  return user?.accessLevel === 'manager' || user?.accessLevel === 'master'
}

export function canManageUsers(user: AppUser | null): boolean {
  return isManagerOrMaster(user)
}

/** לייבלים — יצירה ועריכה למאסטר בלבד */
export function canManageLabels(user: AppUser | null): boolean {
  return isMaster(user)
}

/** רעיון-מארז עם תת-רעיונות — יצירה למנהל בלבד */
export function canCreateContainerIdea(user: AppUser | null): boolean {
  return user?.accessLevel === 'manager'
}

function isOthersMasterPrivate(user: AppUser, idea: Idea): boolean {
  return idea.visibility === 'master_private' && idea.createdByUserId !== user.id
}

/** מנהלים ומאסטר — עריכה, העברה וסימון הושלם לכל משימה גלויה (לא master_private של אחר) */
export function canEditIdea(user: AppUser | null, idea: Idea): boolean {
  if (!user) return false
  if (isOthersMasterPrivate(user, idea)) return false
  if (user.accessLevel === 'manager' || user.accessLevel === 'master') return true
  if (user.accessLevel === 'guest') {
    return (
      idea.createdByUserId === user.id &&
      !!idea.guestSessionId &&
      idea.guestSessionId === user.guestSessionId
    )
  }
  return idea.createdByUserId === user.id || idea.assigneeUserId === user.id
}

/** מחיקה — מאסטר לכל המשימות הגלויות; יוצר (משתמש רגיל) למשימות שלו בלבד */
export function canDeleteIdea(user: AppUser | null, idea: Idea): boolean {
  if (!user) return false
  if (user.accessLevel === 'master') {
    return !isOthersMasterPrivate(user, idea)
  }
  if (user.accessLevel === 'manager' || user.accessLevel === 'guest') return false
  return idea.createdByUserId === user.id
}

export function canAddSubIdea(
  user: AppUser | null,
  parent: Idea,
): boolean {
  if (!user || parent.ideaKind !== 'container') return false
  return canEditIdea(user, parent)
}

/** טיימליין מאסטר — תכנון תאריך לרעיונות גלויים */
export function canScheduleOnTimeline(user: AppUser | null, idea: Idea): boolean {
  if (!isMaster(user)) return false
  if (isOthersMasterPrivate(user!, idea)) return false
  return true
}

/** מאסטר — שליחה לתור ביצוע / בדיקות שוטפות */
export function canManageMasterWorkflow(user: AppUser | null, idea: Idea): boolean {
  if (!isMaster(user)) return false
  if (isOthersMasterPrivate(user!, idea)) return false
  return true
}

export function canViewIdea(
  viewer: AppUser | null,
  idea: Idea,
  _usersById: Map<string, StoredUser>,
): boolean {
  if (!viewer) return false

  if (idea.createdByUserId === viewer.id) return true
  if (idea.assigneeUserId === viewer.id) return true

  if (idea.visibility === 'master_private') return false

  if (viewer.accessLevel === 'manager' || viewer.accessLevel === 'master') {
    return true
  }

  if (viewer.accessLevel === 'guest') {
    return (
      idea.guestSessionId != null &&
      idea.guestSessionId === viewer.guestSessionId &&
      idea.createdByUserId === viewer.id
    )
  }

  // member — רק רעיונות team (כולל מנהל שפתח ל"כל המשתמשים")
  if (idea.visibility === 'managers_only') return false
  if (idea.visibility === 'team') return true

  return false
}

export function filterVisibleIdeas(
  ideas: Idea[],
  viewer: AppUser | null,
  usersById: Map<string, StoredUser>,
): Idea[] {
  if (!viewer) return []
  const byId = new Map(ideas.map((i) => [i.id, i]))
  return ideas.filter((idea) => {
    if (idea.parentId) {
      const parent = byId.get(idea.parentId)
      if (!parent) return false
      return canViewIdea(viewer, parent, usersById)
    }
    return canViewIdea(viewer, idea, usersById)
  })
}
