import {
  Archive,
  CirclePlus,
  LayoutDashboard,
  Lightbulb,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { cn } from '../../lib/cn'
import type { BottomNavItem } from '../../types/navigation'

const navItems: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: ROUTES.home, icon: LayoutDashboard },
  { id: 'ideas', label: 'Ideas', to: ROUTES.ideas, icon: Lightbulb },
  { id: 'inbox', label: 'Inbox', to: ROUTES.inbox, icon: Archive },
  { id: 'add', label: 'Add', to: ROUTES.addIdea, icon: CirclePlus },
]

function isActive(pathname: string, item: BottomNavItem): boolean {
  if (item.id === 'dashboard') return pathname === ROUTES.home
  if (item.id === 'ideas')
    return pathname.startsWith('/ideas') && pathname !== ROUTES.addIdea
  if (item.id === 'inbox') return pathname === ROUTES.inbox
  if (item.id === 'add') return pathname === ROUTES.addIdea
  return false
}

export function Footer() {
  const { pathname } = useLocation()
  const { stats } = useIdeas()

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-[4.5rem] w-full items-center justify-around border-t border-white/60 bg-white/75 px-2 shadow-nav backdrop-blur-2xl md:hidden"
      aria-label="ניווט תחתון"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item)
        return (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              'relative flex min-w-[4rem] flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200 active:scale-90',
              active
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-secondary',
            )}
          >
            <Icon
              className="h-6 w-6"
              fill={active ? 'currentColor' : 'none'}
              aria-hidden
            />
            <span className="mt-0.5 font-label-sm">{item.label}</span>
            {item.id === 'inbox' && stats.inboxCount > 0 && (
              <span className="absolute left-3 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
                {stats.inboxCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
