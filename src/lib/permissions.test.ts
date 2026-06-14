import { describe, expect, it } from 'vitest'
import { canDeleteIdea, canEditIdea, canManageUsers, canViewIdea, filterVisibleIdeas } from './permissions'
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

const master: AppUser = {
  id: 'master1',
  name: 'מאסטר',
  jobTitle: 'מאסטר',
  initials: 'מ',
  email: 'master@test.io',
  username: 'master1',
  accessLevel: 'master',
  active: true,
}

const baseIdea: Idea = {
  id: 'i1',
  externalId: 'if-1',
  title: 'Test',
  description: 'Desc',
  category: 'development',
  department: 'פיתוח',
  ideaSource: 'mitamim',
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
  visibility: 'team',
}

const usersById = new Map<string, StoredUser>([
  ['nir', { ...manager, passwordHash: '' }],
  ['golan', { ...member, passwordHash: '' }],
  ['master1', { ...master, passwordHash: '' }],
])

describe('permissions', () => {
  it('master can manage users', () => {
    expect(canManageUsers(master)).toBe(true)
    expect(canManageUsers(manager)).toBe(true)
    expect(canManageUsers(member)).toBe(false)
  })

  it('manager sees all non-private ideas', () => {
    expect(canViewIdea(manager, baseIdea, usersById)).toBe(true)
    expect(
      canViewIdea(manager, { ...baseIdea, visibility: 'managers_only' }, usersById),
    ).toBe(true)
  })

  it('manager cannot see others master_private', () => {
    expect(
      canViewIdea(
        manager,
        { ...baseIdea, visibility: 'master_private', createdByUserId: 'master1' },
        usersById,
      ),
    ).toBe(false)
  })

  it('master sees own private idea', () => {
    expect(
      canViewIdea(
        master,
        { ...baseIdea, visibility: 'master_private', createdByUserId: 'master1' },
        usersById,
      ),
    ).toBe(true)
  })

  it('member sees team ideas from others', () => {
    expect(canViewIdea(member, baseIdea, usersById)).toBe(true)
  })

  it('member cannot see others managers_only', () => {
    expect(
      canViewIdea(
        member,
        { ...baseIdea, visibility: 'managers_only', createdByUserId: 'nir' },
        usersById,
      ),
    ).toBe(false)
  })

  it('manager cannot edit others master_private', () => {
    expect(
      canEditIdea(
        manager,
        { ...baseIdea, visibility: 'master_private', createdByUserId: 'master1' },
      ),
    ).toBe(false)
  })

  it('manager can edit team idea opened by member', () => {
    expect(canEditIdea(manager, baseIdea)).toBe(true)
  })

  it('master can edit team idea opened by member', () => {
    expect(canEditIdea(master, baseIdea)).toBe(true)
  })

  it('master cannot edit others master_private', () => {
    expect(
      canEditIdea(
        master,
        { ...baseIdea, visibility: 'master_private', createdByUserId: 'other-master' },
      ),
    ).toBe(false)
  })

  it('master can delete team idea opened by member', () => {
    expect(canDeleteIdea(master, baseIdea)).toBe(true)
  })

  it('manager cannot delete others ideas', () => {
    expect(canDeleteIdea(manager, baseIdea)).toBe(false)
  })

  it('member can delete own idea', () => {
    expect(canDeleteIdea(member, { ...baseIdea, createdByUserId: 'golan' })).toBe(true)
  })

  it('assignee can edit', () => {
    const assigned = { ...baseIdea, createdByUserId: 'nir', assigneeUserId: 'golan' }
    expect(canEditIdea(member, assigned)).toBe(true)
  })

  it('members see team ideas in filter', () => {
    const ideas = [
      baseIdea,
      {
        ...baseIdea,
        id: 'i2',
        visibility: 'managers_only' as const,
        createdByUserId: 'nir',
      },
    ]
    const visible = filterVisibleIdeas(ideas, member, usersById)
    expect(visible).toHaveLength(1)
    expect(visible[0].id).toBe('i1')
  })
})
