import { CirclePlus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LABELS, ROUTES } from '../../constants/app'
import { visibleNavItems } from '../../config/appNavigation'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { canManageUsers, isMaster } from '../../lib/permissions'
import { cn } from '../../lib/cn'

export function Footer() {
  const { pathname } = useLocation()
  const { stats } = useIdeas()
  const { user } = useAuth()

  const navItems = visibleNavItems({
    canManageUsers: canManageUsers(user),
    isMaster: isMaster(user),
  })

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-[4.5rem] w-full items-center gap-0.5 overflow-x-auto border-t border-border-light bg-background px-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="ניווט תחתון"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = item.match(pathname)
        return (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              'relative flex min-w-[3.5rem] shrink-0 flex-col items-center justify-center px-1.5 py-1 transition-colors duration-300',
              active ? 'text-on-surface' : 'text-secondary',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="mt-0.5 max-w-[4.5rem] truncate text-micro uppercase">{item.label}</span>
            {active && (
              <span className="absolute top-0 h-px w-8 bg-primary" aria-hidden />
            )}
            {item.id === 'inbox' && stats.inboxCount > 0 && (
              <span className="absolute left-2 top-0 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-medium text-on-primary">
                {stats.inboxCount}
              </span>
            )}
          </Link>
        )
      })}

      <Link
        to={ROUTES.addIdea}
        className={cn(
          'relative flex min-w-[3.5rem] shrink-0 flex-col items-center justify-center px-1.5 py-1 transition-colors duration-300',
          pathname === ROUTES.addIdea ? 'text-primary' : 'text-secondary',
        )}
        aria-label={NAV_LABELS.add}
      >
        <span className="flex h-11 w-11 items-center justify-center bg-primary text-on-primary">
          <CirclePlus className="h-5 w-5" aria-hidden />
        </span>
        <span className="mt-1 text-micro uppercase">{NAV_LABELS.add}</span>
      </Link>
    </nav>
  )
}
