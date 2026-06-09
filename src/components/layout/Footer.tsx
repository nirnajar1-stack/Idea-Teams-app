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
      className="nav-glass fixed bottom-0 left-0 z-50 flex h-[4.5rem] w-full items-center gap-0.5 overflow-x-auto border-t px-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              'relative flex min-w-[3.5rem] shrink-0 flex-col items-center justify-center rounded-xl px-1.5 py-1 transition-all duration-200 active:scale-90',
              active ? 'bg-primary/10 font-semibold text-primary' : 'text-secondary',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="mt-0.5 max-w-[4.5rem] truncate font-label-sm">{item.label}</span>
            {item.id === 'inbox' && stats.inboxCount > 0 && (
              <span className="absolute left-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
                {stats.inboxCount}
              </span>
            )}
          </Link>
        )
      })}

      <Link
        to={ROUTES.addIdea}
        className={cn(
          'relative -mt-4 flex min-w-[3.5rem] shrink-0 flex-col items-center justify-center rounded-xl px-1.5 py-1 transition-all duration-200 active:scale-90',
          pathname === ROUTES.addIdea
            ? 'font-semibold text-primary'
            : 'text-secondary',
        )}
        aria-label={NAV_LABELS.add}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-glow">
          <CirclePlus className="h-6 w-6" aria-hidden />
        </span>
        <span className="mt-1 font-label-sm">{NAV_LABELS.add}</span>
      </Link>
    </nav>
  )
}
