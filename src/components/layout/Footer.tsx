import { CirclePlus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NAV_LABELS, ROUTES } from '../../constants/app'
import { mobileFooterNavItems } from '../../config/appNavigation'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { useQuickAdd } from '../../context/QuickAddContext'
import { canManageUsers, isMaster } from '../../lib/permissions'
import { cn } from '../../lib/cn'
import { Link } from 'react-router-dom'

export function Footer() {
  const { pathname } = useLocation()
  const { stats } = useIdeas()
  const { user } = useAuth()
  const { openQuickAdd, isOpen: quickAddOpen } = useQuickAdd()

  const navItems = mobileFooterNavItems({
    canManageUsers: canManageUsers(user),
    isMaster: isMaster(user),
  })

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 z-50 w-full px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="ניווט תחתון"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-md items-center justify-around gap-0.5 rounded-full bg-[var(--color-nav-pill)] px-3 text-[var(--color-nav-pill-fg)] shadow-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                'relative flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 transition-colors duration-200',
                active ? 'text-white' : 'text-white/40',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className="h-[22px] w-[22px] shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              {active && (
                <span className="h-1 w-1 rounded-full bg-white" aria-hidden />
              )}
              <span className="sr-only">{item.label}</span>
              {item.id === 'inbox' && stats.inboxCount > 0 && (
                <span className="absolute top-0 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--color-nav-pill)]">
                  {stats.inboxCount}
                </span>
              )}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={openQuickAdd}
          className={cn(
            'relative flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 transition-colors duration-200',
            quickAddOpen || pathname === ROUTES.addIdea
              ? 'text-white'
              : 'text-white/40',
          )}
          aria-label={NAV_LABELS.add}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-nav-pill)] shadow-soft">
            <CirclePlus className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </span>
        </button>
      </div>
    </nav>
  )
}
