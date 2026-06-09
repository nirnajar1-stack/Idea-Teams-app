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
        'flex items-center gap-0.5 overflow-x-auto overscroll-x-contain pb-0.5',
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
              'relative flex shrink-0 items-center rounded-xl font-label-md transition-colors duration-200',
              compact
                ? 'min-w-[3.25rem] flex-col gap-0.5 px-2 py-1.5'
                : 'gap-1.5 px-2.5 py-2 sm:px-3',
              active
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-secondary hover:bg-primary/5 hover:text-on-surface',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('shrink-0', compact ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
            <span className={cn(compact ? 'font-label-sm leading-tight' : 'whitespace-nowrap')}>
              {item.label}
            </span>
            {item.id === 'inbox' && inboxCount > 0 && (
              <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
                {inboxCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
