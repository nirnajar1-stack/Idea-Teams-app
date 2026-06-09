import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import type { AppNavItem } from '../../config/appNavigation'

export interface NavTabsProps {
  items: AppNavItem[]
  pathname: string
  inboxCount?: number
  compact?: boolean
}

export function NavTabs({ items, pathname, inboxCount = 0, compact = false }: NavTabsProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-1 overflow-x-auto overscroll-x-contain pb-0.5',
        compact ? 'justify-start' : 'md:justify-center',
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
              'relative flex shrink-0 items-center rounded-none px-3 py-2 text-label-md uppercase transition-colors duration-300',
              compact
                ? 'min-w-[3.25rem] flex-col gap-1'
                : 'gap-2',
              active
                ? 'text-on-surface'
                : 'text-secondary hover:text-on-surface',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('shrink-0', compact ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
            <span className={cn(compact ? 'text-micro leading-tight' : 'whitespace-nowrap')}>
              {item.label}
            </span>
            {active && (
              <span className="absolute inset-x-2 -bottom-0.5 h-px bg-primary" aria-hidden />
            )}
            {item.id === 'inbox' && inboxCount > 0 && (
              <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-micro font-medium text-on-primary">
                {inboxCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
