import type { AppUser } from '../types/user'

export const SEED_AUTHORS: Record<'nir' | 'golan', AppUser> = {
  nir: {
    id: 'nir',
    name: 'ניר',
    jobTitle: 'מנהל מוצר',
    initials: 'ניר',
    email: 'nir@ideaflow.io',
    username: 'nir',
    accessLevel: 'manager',
    active: true,
  },
  golan: {
    id: 'golan',
    name: 'גולן',
    jobTitle: 'ראש צוות בקרה',
    initials: 'גול',
    email: 'golan@ideaflow.io',
    username: 'golan',
    accessLevel: 'member',
    active: true,
  },
}
