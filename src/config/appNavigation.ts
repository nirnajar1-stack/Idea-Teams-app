import {
  Archive,
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  Lightbulb,
  Tag,
  UserCog,
  UserRound,
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
  | 'users'
  | 'profile'

export interface AppNavItem {
  id: AppNavItemId
  label: string
  to: string
  icon: LucideIcon
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
    match: (p) => p === ROUTES.home,
  },
  {
    id: 'ideas',
    label: NAV_LABELS.ideas,
    to: ROUTES.ideas,
    icon: Lightbulb,
    match: ideasMatch,
  },
  {
    id: 'inbox',
    label: NAV_LABELS.inbox,
    to: ROUTES.inbox,
    icon: Archive,
    match: (p) => p === ROUTES.inbox,
  },
  {
    id: 'openTasks',
    label: NAV_LABELS.openTasks,
    to: ROUTES.openTasksDashboard,
    icon: BarChart3,
    match: (p) => p === ROUTES.openTasksDashboard,
  },
  {
    id: 'timeline',
    label: NAV_LABELS.timeline,
    to: ROUTES.timeline,
    icon: CalendarRange,
    match: (p) => p === ROUTES.timeline,
    visible: ({ isMaster }) => isMaster,
  },
  {
    id: 'labels',
    label: NAV_LABELS.labels,
    to: ROUTES.labels,
    icon: Tag,
    match: (p) => p === ROUTES.labels,
    visible: ({ isMaster }) => isMaster,
  },
  {
    id: 'users',
    label: NAV_LABELS.users,
    to: ROUTES.users,
    icon: UserCog,
    match: (p) => p === ROUTES.users,
    visible: ({ canManageUsers }) => canManageUsers,
  },
  {
    id: 'profile',
    label: NAV_LABELS.profile,
    to: ROUTES.profile,
    icon: UserRound,
    match: (p) => p === ROUTES.profile,
  },
]

export function visibleNavItems(ctx: NavVisibilityContext): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => !item.visible || item.visible(ctx))
}
