import { describe, expect, it } from 'vitest'
import {
  canAccessPage,
  canCompleteIdea,
  passesPermissionGate,
} from './permissionMatrix'
import type { Idea } from '../types/idea'
import type { PermissionKey, PermissionRule } from '../types/permission'
import type { AppUser } from '../types/user'

const master: AppUser = {
  id: 'm1',
  name: 'Master',
  email: 'm@x',
  jobTitle: 'מאסטר',
  initials: 'MA',
  username: 'master',
  accessLevel: 'master',
  active: true,
}

const member: AppUser = {
  id: 'u1',
  name: 'Member',
  email: 'u@x',
  jobTitle: 'משתמש',
  initials: 'ME',
  username: 'member',
  accessLevel: 'member',
  active: true,
}

const idea: Idea = {
  id: 'i1',
  externalId: 'EXT-1',
  title: 't',
  description: '',
  category: 'development',
  department: 'פיתוח',
  ideaSource: 'mitamim',
  priority: 'medium',
  workflowStatus: 'in_progress',
  progress: 10,
  progressStep: '',
  createdAt: '2024-01-01',
  targetStartDate: '2024-01-15',
  sendToMaybeInbox: false,
  createdByUserId: 'u1',
  authorName: 'Member',
  authorRole: 'משתמש',
  authorInitials: 'ME',
  tags: [],
  goals: [],
  attachments: [],
  visibility: 'team',
  ideaKind: 'standard',
}

function rules(
  entries: Partial<Record<PermissionKey, Pick<PermissionRule, 'mode' | 'groupIds'>>>,
): Map<PermissionKey, PermissionRule> {
  const map = new Map<PermissionKey, PermissionRule>()
  for (const [key, value] of Object.entries(entries) as [
    PermissionKey,
    Pick<PermissionRule, 'mode' | 'groupIds'>,
  ][]) {
    map.set(key, {
      key,
      mode: value.mode,
      groupIds: value.groupIds ?? [],
    })
  }
  return map
}

describe('permission matrix', () => {
  it('master always passes gate', () => {
    expect(
      passesPermissionGate(master, [], {
        key: 'action.complete_idea',
        mode: 'disabled',
        groupIds: [],
      }),
    ).toBe(true)
  })

  it('disabled blocks non-master', () => {
    expect(
      passesPermissionGate(member, ['g1'], {
        key: 'action.complete_idea',
        mode: 'disabled',
        groupIds: [],
      }),
    ).toBe(false)
  })

  it('groups mode allows only listed groups', () => {
    const rule: PermissionRule = {
      key: 'action.complete_idea',
      mode: 'groups',
      groupIds: ['g-x', 'g-y'],
    }
    expect(passesPermissionGate(member, ['g-x'], rule)).toBe(true)
    expect(passesPermissionGate(member, ['g-z'], rule)).toBe(false)
  })

  it('complete_idea in groups mode allows viewers in allowed groups', () => {
    const map = rules({
      'action.complete_idea': { mode: 'groups', groupIds: ['g-x'] },
    })
    expect(canCompleteIdea(member, idea, ['g-x'], map)).toBe(true)
    expect(canCompleteIdea(member, idea, ['g-other'], map)).toBe(false)
  })

  it('page access respects groups override over role default', () => {
    const map = rules({
      'page.timeline': { mode: 'groups', groupIds: ['g-x'] },
    })
    expect(canAccessPage('page.timeline', member, ['g-x'], map, false)).toBe(true)
    expect(canAccessPage('page.timeline', member, [], map, false)).toBe(false)
    expect(canAccessPage('page.timeline', member, [], map, true)).toBe(false)
  })

  it('page.permissions stays master-only', () => {
    const map = rules({
      'page.permissions': { mode: 'groups', groupIds: ['g-x'] },
    })
    expect(canAccessPage('page.permissions', member, ['g-x'], map, true)).toBe(false)
    expect(canAccessPage('page.permissions', master, [], map, false)).toBe(true)
  })
})
