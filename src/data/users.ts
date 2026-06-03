import type { AppUser, UserId } from '../types/user'

export const USERS: Record<UserId, AppUser> = {
  nir: {
    id: 'nir',
    name: 'ניר',
    role: 'מנהל מוצר',
    initials: 'ניר',
    email: 'nir@ideaflow.io',
  },
  golan: {
    id: 'golan',
    name: 'גולן',
    role: 'ראש צוות בקרה',
    initials: 'גול',
    email: 'golan@ideaflow.io',
  },
}

export const USER_LIST: AppUser[] = [USERS.nir, USERS.golan]

export function getUserById(id: UserId): AppUser {
  return USERS[id]
}
