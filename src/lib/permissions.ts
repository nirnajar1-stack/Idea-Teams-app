import type { Idea } from '../types/idea'
import type { AccessLevel, AppUser, StoredUser } from '../types/user'

export function canManageUsers(user: AppUser | null): boolean {
  return user?.accessLevel === 'manager'
}

export function canDeleteIdea(user: AppUser | null, idea: Idea): boolean {
  if (!user) return false
  if (user.accessLevel === 'manager') return true
  if (user.accessLevel === 'guest') return false
  return idea.createdByUserId === user.id
}

export function canEditIdea(user: AppUser | null, idea: Idea): boolean {
  if (!user) return false
  if (user.accessLevel === 'manager') return true
  if (user.accessLevel === 'guest') {
    return (
      idea.createdByUserId === user.id &&
      !!idea.guestSessionId &&
      idea.guestSessionId === user.guestSessionId
    )
  }
  return idea.createdByUserId === user.id
}

function creatorAccessLevel(
  idea: Idea,
  usersById: Map<string, StoredUser>,
): AccessLevel | null {
  const creator = usersById.get(idea.createdByUserId)
  if (creator) return creator.accessLevel
  if (idea.guestSessionId) return 'guest'
  return 'member'
}

export function canViewIdea(
  viewer: AppUser | null,
  idea: Idea,
  usersById: Map<string, StoredUser>,
): boolean {
  if (!viewer) return false
  if (viewer.accessLevel === 'manager') return true

  if (viewer.accessLevel === 'guest') {
    return (
      idea.guestSessionId != null &&
      idea.guestSessionId === viewer.guestSessionId &&
      idea.createdByUserId === viewer.id
    )
  }

  const level = creatorAccessLevel(idea, usersById)
  return level === 'manager' || level === 'member'
}

export function filterVisibleIdeas(
  ideas: Idea[],
  viewer: AppUser | null,
  usersById: Map<string, StoredUser>,
): Idea[] {
  if (!viewer) return []
  return ideas.filter((idea) => canViewIdea(viewer, idea, usersById))
}
