import {
  Archive,
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Tag,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NAV_LABELS, ROUTES } from '../constants/app'

export type AppNavItemId =
  | 'home'
  | 'ideas'
  | 'inbox'
  | 'openTasks'
  | 'timeline'
  | 'labels'
  | 'groups'
  | 'emailLog'
  | 'users'
  | 'profile'

/** primary — ניווט ראשי; manage — מקובץ תחת תפריט ניהול */
export type AppNavGroup = 'primary' | 'manage'

export interface AppNavItem {
  id: AppNavItemId
  label: string
  to: string
  icon: LucideIcon
  group: AppNavGroup
  match: (pathname: string) => boolean
  /** אם לא מוגדר — תמיד מוצג */
  visible?: (ctx: NavVisibilityContext) => boolean
}

export interface NavVisibilityContext {
  canManageUsers: boolean
  isMaster: boolean
}

function ideasMatch(pathname: string): boolean {
  return pathname.startsWith('/ideas') && pathname !== ROUTES.addIdea
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    id: 'home',
    label: NAV_LABELS.home,
    to: ROUTES.home,
    icon: LayoutDashboard,
    group: 'primary',
    match: (p) => p === ROUTES.home,
  },
  {
    id: 'ideas',
    label: NAV_LABELS.ideas,
    to: ROUTES.ideas,
    icon: Lightbulb,
    group: 'primary',
    match: ideasMatch,
  },
  {
    id: 'inbox',
    label: NAV_LABELS.inbox,
    to: ROUTES.inbox,
    icon: Archive,
    group: 'primary',
    match: (p) => p === ROUTES.inbox,
  },
  {
    id: 'openTasks',
    label: NAV_LABELS.openTasks,
    to: ROUTES.openTasksDashboard,
    icon: BarChart3,
    group: 'primary',
    match: (p) => p === ROUTES.openTasksDashboard,
  },
  {
    id: 'timeline',
    label: NAV_LABELS.timeline,
    to: ROUTES.timeline,
    icon: CalendarRange,
    group: 'primary',
    match: (p) => p === ROUTES.timeline,
    visible: ({ isMaster }) => isMaster,
  },
  {
    id: 'labels',
    label: NAV_LABELS.labels,
    to: ROUTES.labels,
    icon: Tag,
    group: 'manage',
    match: (p) => p === ROUTES.labels,
    visible: ({ isMaster }) => isMaster,
  },
  {
    id: 'groups',
    label: NAV_LABELS.groups,
    to: ROUTES.groups,
    icon: Users,
    group: 'manage',
    match: (p) => p === ROUTES.groups,
    visible: ({ canManageUsers }) => canManageUsers,
  },
  {
    id: 'emailLog',
    label: NAV_LABELS.emailLog,
    to: ROUTES.emailLog,
    icon: Mail,
    group: 'manage',
    match: (p) => p === ROUTES.emailLog,
    visible: ({ canManageUsers }) => canManageUsers,
  },
  {
    id: 'users',
    label: NAV_LABELS.users,
    to: ROUTES.users,
    icon: UserCog,
    group: 'manage',
    match: (p) => p === ROUTES.users,
    visible: ({ canManageUsers }) => canManageUsers,
  },
  {
    id: 'profile',
    label: NAV_LABELS.profile,
    to: ROUTES.profile,
    icon: UserRound,
    group: 'primary',
    match: (p) => p === ROUTES.profile,
  },
]

export function visibleNavItems(ctx: NavVisibilityContext): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => !item.visible || item.visible(ctx))
}

export function splitVisibleNavItems(ctx: NavVisibilityContext): {
  primary: AppNavItem[]
  manage: AppNavItem[]
} {
  const visible = visibleNavItems(ctx)
  return {
    primary: visible.filter((item) => item.group === 'primary'),
    manage: visible.filter((item) => item.group === 'manage'),
  }
}

/**
 * ניווט תחתון במובייל — עד 4 יעדים + FAB.
 * פרופיל דרך Avatar ב-Navbar; אדמין דרך תפריט ניהול / פרופיל.
 */
export function mobileFooterNavItems(ctx: NavVisibilityContext): AppNavItem[] {
  const { primary } = splitVisibleNavItems(ctx)
  const ids = ctx.isMaster
    ? (['home', 'ideas', 'inbox', 'timeline'] as const)
    : (['home', 'ideas', 'inbox', 'openTasks'] as const)

  return ids
    .map((id) => primary.find((item) => item.id === id))
    .filter((item): item is AppNavItem => Boolean(item))
}
