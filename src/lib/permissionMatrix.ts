import type { Idea } from '../types/idea'
import type {
  PermissionKey,
  PermissionMode,
  PermissionRule,
} from '../types/permission'
import { defaultRule } from '../types/permission'
import type { AppUser, StoredUser } from '../types/user'
import {
  canDeleteIdea as canDeleteIdeaBase,
  canEditIdea as canEditIdeaBase,
  canManageLabels as canManageLabelsBase,
  canManageMasterWorkflow as canManageMasterWorkflowBase,
  canManageUsers as canManageUsersBase,
  canScheduleOnTimeline as canScheduleOnTimelineBase,
  canViewIdea,
  isMaster,
  isManagerOrMaster,
} from './permissions'

export interface PermissionEvalContext {
  user: AppUser | null
  myGroupIds: string[]
  rules: Map<PermissionKey, PermissionRule>
}

function getRule(
  rules: Map<PermissionKey, PermissionRule> | undefined,
  key: PermissionKey,
): PermissionRule {
  return rules?.get(key) ?? defaultRule(key)
}

/**
 * בודק שער קבוצות/חסימה.
 * מאסטר תמיד עובר.
 * mode=default → השער פתוח (מסתמכים על לוגיקת תפקיד).
 */
export function passesPermissionGate(
  user: AppUser | null,
  myGroupIds: string[],
  rule: PermissionRule | undefined,
): boolean {
  if (!user) return false
  if (isMaster(user)) return true

  const mode: PermissionMode = rule?.mode ?? 'default'
  if (mode === 'default') return true
  if (mode === 'disabled') return false
  const allowed = rule?.groupIds ?? []
  if (allowed.length === 0) return false
  return myGroupIds.some((id) => allowed.includes(id))
}

export function canAccessPage(
  key: PermissionKey,
  user: AppUser | null,
  myGroupIds: string[],
  rules: Map<PermissionKey, PermissionRule> | undefined,
  defaultAllowed: boolean,
): boolean {
  if (!user) return false
  if (key === 'page.permissions') return isMaster(user)
  if (isMaster(user)) return true

  const rule = getRule(rules, key)
  if (rule.mode === 'disabled') return false
  if (rule.mode === 'groups') {
    return passesPermissionGate(user, myGroupIds, rule)
  }
  return defaultAllowed
}

function withActionGate(
  ctx: PermissionEvalContext,
  key: PermissionKey,
  baseAllowed: boolean,
): boolean {
  if (!ctx.user) return false
  if (!passesPermissionGate(ctx.user, ctx.myGroupIds, getRule(ctx.rules, key))) {
    return false
  }
  return baseAllowed
}

export function canCompleteIdea(
  user: AppUser | null,
  idea: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
  usersById: Map<string, StoredUser> = new Map(),
): boolean {
  if (!user) return false
  const rule = getRule(rules, 'action.complete_idea')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false

  if (rule.mode === 'groups') {
    return canViewIdea(user, idea, usersById, myGroupIds)
  }
  return canEditIdeaBase(user, idea, myGroupIds)
}

export function canEditIdeaWithRules(
  user: AppUser | null,
  idea: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  return withActionGate(
    { user, myGroupIds, rules: rules ?? new Map() },
    'action.edit_idea',
    canEditIdeaBase(user, idea, myGroupIds),
  )
}

export function canDeleteIdeaWithRules(
  user: AppUser | null,
  idea: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  return withActionGate(
    { user, myGroupIds, rules: rules ?? new Map() },
    'action.delete_idea',
    canDeleteIdeaBase(user, idea),
  )
}

export function canCreateIdeaWithRules(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  if (!user) return false
  if (!passesPermissionGate(user, myGroupIds, getRule(rules, 'action.create_idea'))) {
    return false
  }
  const rule = getRule(rules, 'action.create_idea')
  if (rule.mode === 'groups') return true
  return true
}

export function canCreateSubIdeaWithRules(
  user: AppUser | null,
  parent: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  if (!user || parent.ideaKind !== 'container') return false
  return withActionGate(
    { user, myGroupIds, rules: rules ?? new Map() },
    'action.create_sub_idea',
    canEditIdeaBase(user, parent, myGroupIds),
  )
}

export function canManageExecutionWithRules(
  user: AppUser | null,
  idea: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = canManageMasterWorkflowBase(user, idea)
  const rule = getRule(rules, 'action.manage_execution')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return canViewIdea(user, idea, new Map(), myGroupIds)
  return base
}

export function canScheduleTimelineWithRules(
  user: AppUser | null,
  idea: Idea,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = canScheduleOnTimelineBase(user, idea)
  const rule = getRule(rules, 'action.schedule_timeline')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return canViewIdea(user, idea, new Map(), myGroupIds)
  return base
}

export function canManageExecutionAction(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  if (!user) return false
  const rule = getRule(rules, 'action.manage_execution')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return true
  return isMaster(user)
}

export function canExportIdeasWithRules(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = isMaster(user)
  const rule = getRule(rules, 'action.export_ideas')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return true
  return base
}

export function canManageLabelsWithRules(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = canManageLabelsBase(user)
  const rule = getRule(rules, 'action.manage_labels')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return true
  return base
}

export function canManageUsersWithRules(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = canManageUsersBase(user)
  const rule = getRule(rules, 'action.manage_users')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return true
  return base
}

export function canManageGroupsWithRules(
  user: AppUser | null,
  myGroupIds: string[] = [],
  rules?: Map<PermissionKey, PermissionRule>,
): boolean {
  const base = isManagerOrMaster(user)
  const rule = getRule(rules, 'action.manage_groups')
  if (!passesPermissionGate(user, myGroupIds, rule)) return false
  if (rule.mode === 'groups') return true
  return base
}

/** מיפוי ניווט → מפתח הרשאת דף */
export const NAV_TO_PAGE_KEY: Partial<Record<string, PermissionKey>> = {
  home: 'page.home',
  ideas: 'page.ideas',
  inbox: 'page.inbox',
  openTasks: 'page.openTasks',
  timeline: 'page.timeline',
  labels: 'page.labels',
  groups: 'page.groups',
  emailLog: 'page.emailLog',
  users: 'page.users',
  profile: 'page.profile',
  boards: 'page.boards',
}
