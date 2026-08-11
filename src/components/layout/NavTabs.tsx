import { Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NAV_LABELS, ROUTES } from '../../constants/app'
import { cn } from '../../lib/cn'
import type { AppNavItem } from '../../config/appNavigation'

export interface NavTabsProps {
  items: AppNavItem[]
  manageItems?: AppNavItem[]
  pathname: string
  inboxCount?: number
  compact?: boolean
}

export function NavTabs({
  items,
  manageItems = [],
  pathname,
  inboxCount = 0,
  compact = false,
}: NavTabsProps) {
  const manageActive =
    pathname === ROUTES.manage ||
    manageItems.some((item) => item.match(pathname))

  return (
    <div className="flex min-w-0 items-center gap-1">
      <nav
        className={cn(
          'flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain scroll-smooth pb-0.5',
          compact ? 'justify-start gap-0.5' : 'md:justify-center',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        aria-label="ניווט ראשי"
      >
        {items.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                'relative flex shrink-0 items-center rounded-full transition-colors duration-300',
                compact
                  ? 'min-h-11 min-w-[4.25rem] flex-col justify-center gap-0.5 px-2.5 py-1.5'
                  : 'gap-2 px-3.5 py-2 text-label-md',
                active
                  ? 'bg-primary text-on-primary shadow-boutique'
                  : 'text-secondary hover:bg-surface-container hover:text-on-surface',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className={cn(
                  compact
                    ? 'max-w-[4.5rem] truncate text-[0.65rem] font-medium leading-tight'
                    : 'whitespace-nowrap',
                )}
              >
                {item.label}
              </span>
              {item.id === 'inbox' && inboxCount > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-micro font-medium text-on-primary ring-2 ring-background">
                  {inboxCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {manageItems.length > 0 && (
        <Link
          to={ROUTES.manage}
          className={cn(
            'relative flex shrink-0 items-center rounded-full transition-colors duration-300',
            compact
              ? 'min-h-11 min-w-[4.25rem] flex-col justify-center gap-0.5 px-2.5 py-1.5'
              : 'gap-2 px-3.5 py-2 text-label-md',
            manageActive
              ? 'bg-primary text-on-primary shadow-boutique'
              : 'text-secondary hover:bg-surface-container hover:text-on-surface',
          )}
          aria-current={manageActive ? 'page' : undefined}
          aria-label={NAV_LABELS.manage}
        >
          <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
          <span
            className={cn(
              compact
                ? 'text-[0.65rem] font-medium leading-tight'
                : 'whitespace-nowrap',
            )}
          >
            {NAV_LABELS.manage}
          </span>
        </Link>
      )}
    </div>
  )
}
