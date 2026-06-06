import { describe, expect, it } from 'vitest'
import { canEditIdea, canViewIdea, filterVisibleIdeas } from './permissions'
import type { Idea } from '../types/idea'
import type { AppUser, StoredUser } from '../types/user'

const manager: AppUser = {
  id: 'nir',
  name: 'ניר',
  jobTitle: 'מנהל',
  initials: 'נ',
  email: 'nir@test.io',
  username: 'nir',
  accessLevel: 'manager',
  active: true,
}

const member: AppUser = {
  id: 'golan',
  name: 'גולן',
  jobTitle: 'משתמש',
  initials: 'ג',
  email: 'golan@test.io',
  username: 'golan',
  accessLevel: 'member',
  active: true,
}

const baseIdea: Idea = {
  id: 'i1',
  externalId: 'if-1',
  title: 'Test',
  description: 'Desc',
  category: 'development',
  department: 'פיתוח',
  priority: 'medium',
  workflowStatus: 'pending',
  createdAt: '2026-01-01',
  targetStartDate: '2026-02-01',
  sendToMaybeInbox: false,
  createdByUserId: 'golan',
  authorName: 'גולן',
  authorRole: 'משתמש',
  authorInitials: 'ג',
  tags: [],
  goals: [],
  attachments: [],
  progress: 0,
  progressStep: '',
}

const usersById = new Map<string, StoredUser>([
  ['nir', { ...manager, passwordHash: '' }],
  ['golan', { ...member, passwordHash: '' }],
])

describe('permissions', () => {
  it('manager can edit any idea', () => {
    expect(canEditIdea(manager, baseIdea)).toBe(true)
  })

  it('assignee can edit idea', () => {
    const assigned = { ...baseIdea, createdByUserId: 'nir', assigneeUserId: 'golan' }
    expect(canEditIdea(member, assigned)).toBe(true)
  })

  it('member cannot edit others idea without assignee', () => {
    expect(canEditIdea(member, { ...baseIdea, createdByUserId: 'nir' })).toBe(false)
  })

  it('assignee can view idea', () => {
    const assigned = { ...baseIdea, createdByUserId: 'nir', assigneeUserId: 'golan' }
    expect(canViewIdea(member, assigned, usersById)).toBe(true)
  })

  it('member sees ideas from manager and members', () => {
    const ideas = [baseIdea, { ...baseIdea, id: 'i2', createdByUserId: 'nir' }]
    const visible = filterVisibleIdeas(ideas, member, usersById)
    expect(visible).toHaveLength(2)
  })
})
