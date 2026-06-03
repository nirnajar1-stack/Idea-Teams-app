import type { AppUser } from '../types/user'

export function authorFieldsFromUser(user: AppUser) {
  return {
    createdByUserId: user.id,
    authorName: user.name,
    authorRole: user.role,
    authorInitials: user.initials,
  }
}
