import { CirclePlus } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { NAV_LABELS, ROUTES } from '../../constants/app'
import { buildNavContext, mobileFooterNavItems } from '../../config/appNavigation'
import { useAuth } from '../../context/AuthContext'
import { useGroups } from '../../context/GroupsContext'
import { useIdeas } from '../../context/IdeasContext'
import { usePermissions } from '../../context/PermissionsContext'
import { useQuickAdd } from '../../context/QuickAddContext'
import { cn } from '../../lib/cn'

export function Footer() {
  const { pathname } = useLocation()
  const { stats } = useIdeas()
  const { user } = useAuth()
  const { myGroupIds } = useGroups()
  const { rulesByKey } = usePermissions()
  const { openQuickAdd, isOpen: quickAddOpen } = useQuickAdd()

  const navItems = mobileFooterNavItems(
    buildNavContext(user, myGroupIds, rulesByKey),
  )

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 z-50 w-full px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="ניווט תחתון"
    >
      <div className="mx-auto flex h-[4.75rem] max-w-md items-stretch justify-around gap-0.5 rounded-full bg-[var(--color-nav-pill)] px-2 text-[var(--color-nav-pill-fg)] shadow-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 transition-all duration-200 active:scale-95',
                active ? 'text-white' : 'text-white/45',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className="h-[20px] w-[20px] shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              <span className="max-w-full truncate text-[0.6rem] font-medium leading-tight">
                {item.label}
              </span>
              {item.id === 'inbox' && stats.inboxCount > 0 && (
                <span className="absolute top-0 end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--color-nav-pill)]">
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
            'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-all duration-200 active:scale-95',
            quickAddOpen || pathname === ROUTES.addIdea
              ? 'text-white'
              : 'text-white/45',
          )}
          aria-label={NAV_LABELS.add}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-nav-pill)] shadow-soft">
            <CirclePlus className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="text-[0.6rem] font-medium leading-tight">{NAV_LABELS.add}</span>
        </button>
      </div>
    </nav>
  )
}
