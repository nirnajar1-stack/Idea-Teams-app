import { hashPassword } from '../lib/password'
import type { StoredUser } from '../types/user'

export const GUEST_USER_ID = 'guest'

export async function buildDefaultUsers(): Promise<StoredUser[]> {
  const [nirHash, golanHash] = await Promise.all([
    hashPassword('nir123'),
    hashPassword('golan123'),
  ])

  return [
    {
      id: 'nir',
      name: 'ניר',
      jobTitle: 'מנהל מוצר',
      initials: 'ניר',
      email: 'nir@ideaflow.io',
      username: 'nir',
      passwordHash: nirHash,
      accessLevel: 'manager',
      active: true,
    },
    {
      id: 'golan',
      name: 'גולן',
      jobTitle: 'ראש צוות בקרה',
      initials: 'גול',
      email: 'golan@ideaflow.io',
      username: 'golan',
      passwordHash: golanHash,
      accessLevel: 'member',
      active: true,
    },
    {
      id: GUEST_USER_ID,
      name: 'אורח',
      jobTitle: 'גישה זמנית',
      initials: 'או',
      email: 'guest@ideaflow.io',
      username: 'guest',
      passwordHash: '',
      accessLevel: 'guest',
      active: true,
    },
  ]
}
