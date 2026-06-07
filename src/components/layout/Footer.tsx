import {
  Archive,
  CirclePlus,
  LayoutDashboard,
  Lightbulb,
  UserRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LABELS, ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { cn } from '../../lib/cn'
import type { BottomNavItem } from '../../types/navigation'

const navItems: BottomNavItem[] = [
  { id: 'dashboard', label: NAV_LABELS.home, to: ROUTES.home, icon: LayoutDashboard },
  { id: 'ideas', label: NAV_LABELS.ideas, to: ROUTES.ideas, icon: Lightbulb },
  { id: 'add', label: NAV_LABELS.add, to: ROUTES.addIdea, icon: CirclePlus },
  { id: 'inbox', label: NAV_LABELS.inbox, to: ROUTES.inbox, icon: Archive },
  { id: 'profile', label: NAV_LABELS.profile, to: ROUTES.profile, icon: UserRound },
]

function isActive(pathname: string, item: BottomNavItem): boolean {
  if (item.id === 'dashboard') return pathname === ROUTES.home
  if (item.id === 'ideas')
    return pathname.startsWith('/ideas') && pathname !== ROUTES.addIdea
  if (item.id === 'inbox') return pathname === ROUTES.inbox
  if (item.id === 'add') return pathname === ROUTES.addIdea
  if (item.id === 'profile') return pathname === ROUTES.profile
  return false
}

export function Footer() {
  const { pathname } = useLocation()
  const { stats } = useIdeas()

  return (
    <nav
      className="nav-glass fixed bottom-0 left-0 z-50 flex h-[4.5rem] w-full items-center justify-around border-t px-1 md:hidden"
      aria-label="ניווט תחתון"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item)
        const isAdd = item.id === 'add'
        return (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              'relative flex min-w-[3.5rem] flex-col items-center justify-center rounded-xl px-1.5 py-1 transition-all duration-200 active:scale-90',
              isAdd && '-mt-4',
              active
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-secondary',
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center',
                isAdd &&
                  'h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-container shadow-glow text-on-primary',
              )}
            >
              <Icon
                className={cn('h-5 w-5', isAdd && 'h-6 w-6')}
                fill={active && !isAdd ? 'currentColor' : 'none'}
                aria-hidden
              />
            </span>
            <span className={cn('mt-0.5 font-label-sm', isAdd && 'mt-1')}>{item.label}</span>
            {item.id === 'inbox' && stats.inboxCount > 0 && (
              <span className="absolute left-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
                {stats.inboxCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
