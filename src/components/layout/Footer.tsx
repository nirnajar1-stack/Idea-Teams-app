import {
  CirclePlus,
  LayoutDashboard,
  Lightbulb,
  User,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { cn } from '../../lib/cn'
import type { BottomNavItem } from '../../types/navigation'

const navItems: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: ROUTES.home, icon: LayoutDashboard },
  { id: 'ideas', label: 'Ideas', to: ROUTES.ideas, icon: Lightbulb },
  { id: 'add', label: 'Add', to: ROUTES.addIdea, icon: CirclePlus },
  { id: 'profile', label: 'Profile', to: ROUTES.profile, icon: User },
]

function isActive(pathname: string, item: BottomNavItem): boolean {
  if (item.id === 'dashboard') return pathname === ROUTES.home
  if (item.id === 'ideas')
    return pathname.startsWith('/ideas') && pathname !== ROUTES.addIdea
  if (item.id === 'add') return pathname === ROUTES.addIdea
  if (item.id === 'profile') return pathname === ROUTES.profile
  return false
}

export function Footer() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-border-light bg-surface/80 px-4 shadow-nav backdrop-blur-xl md:hidden"
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
              'flex flex-col items-center justify-center transition-transform duration-150 active:scale-90',
              active ? 'font-semibold text-primary' : 'text-secondary',
            )}
          >
            <Icon
              className="h-6 w-6"
              fill={active ? 'currentColor' : 'none'}
              aria-hidden
            />
            <span className="mt-1 font-label-sm">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
