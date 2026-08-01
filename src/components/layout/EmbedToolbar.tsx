import { Link, useLocation } from 'react-router-dom'
import type { AppRoutes } from '../../lib/appRoutes'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useAuth } from '../../context/AuthContext'
import { isMaster } from '../../lib/permissions'
import { cn } from '../../lib/cn'
import { AppLogo } from '../ui/AppLogo'
import { ThemeToggle } from '../ui/ThemeToggle'

type EmbedTab = {
  key: string
  label: string
  path: (r: AppRoutes) => string
  masterOnly?: boolean
}

const TABS: EmbedTab[] = [
  { key: 'home', label: 'לוח בקרה', path: (r) => r.home },
  { key: 'ideas', label: 'רעיונות', path: (r) => r.ideas },
  { key: 'timeline', label: 'טיימליין', path: (r) => r.timeline, masterOnly: true },
]

export function EmbedToolbar() {
  const routes = useAppRoutes()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const showTimeline = isMaster(user)

  return (
    <header className="embed-toolbar sticky top-0 z-40 border-b border-border-light bg-surface-container-lowest/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-container-max items-center justify-between gap-3 px-3 py-2 md:px-6">
        <AppLogo size="xs" showLabel className="min-w-0 shrink" />

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          {TABS.filter((tab) => !tab.masterOnly || showTimeline).map((tab) => {
            const to = tab.path(routes)
            const active =
              tab.key === 'home'
                ? pathname === routes.home
                : pathname === to || pathname.startsWith(`${to}/`)

            return (
              <Link
                key={tab.key}
                to={to}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-label-sm transition-colors',
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-secondary hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
