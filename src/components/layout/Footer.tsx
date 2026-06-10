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
      className="mobile-bottom-nav fixed bottom-0 left-0 z-50 w-full md:hidden"
      aria-label="ניווט תחתון"
    >
      <div className="flex h-[4.25rem] items-stretch justify-around gap-0.5 border-t border-border-light bg-background/95 px-1 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors duration-200',
                active ? 'text-on-surface' : 'text-secondary',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="max-w-full truncate text-[10px] font-medium uppercase tracking-wide">
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 h-0.5 w-7 bg-primary" aria-hidden />
              )}
              {item.id === 'inbox' && stats.inboxCount > 0 && (
                <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-on-primary">
                  {stats.inboxCount}
                </span>
              )}
            </Link>
          )
        })}

        <Link
          to={ROUTES.addIdea}
          className={cn(
            'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition-colors duration-200',
            pathname === ROUTES.addIdea ? 'text-primary' : 'text-secondary',
          )}
          aria-label={NAV_LABELS.add}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-on-primary">
            <CirclePlus className="h-5 w-5" aria-hidden />
          </span>
          <span className="max-w-full truncate text-[10px] font-medium uppercase tracking-wide">
            {NAV_LABELS.add}
          </span>
        </Link>
      </div>
    </nav>
  )
}
