import { ArrowRight, Bell, Lightbulb, LogOut, Search, Share2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'

export type NavbarVariant = 'main' | 'back' | 'ideas'

export interface NavbarProps {
  variant?: NavbarVariant
  brandName?: string
  connectedAs?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showShare?: boolean
}

const mainLinks = [
  { to: ROUTES.home, label: 'Dashboard', match: (p: string) => p === ROUTES.home },
  {
    to: ROUTES.ideas,
    label: 'Ideas',
    match: (p: string) => p.startsWith('/ideas') && p !== ROUTES.addIdea,
  },
  { to: ROUTES.profile, label: 'Community', match: (p: string) => p === ROUTES.profile },
]

export function Navbar({
  variant = 'main',
  brandName = APP_NAME,
  connectedAs,
  searchValue = '',
  onSearchChange,
  showShare = false,
}: NavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-light bg-surface/80 px-margin-mobile shadow-sm backdrop-blur-xl md:px-margin-desktop">
      <div className="flex min-w-0 items-center gap-3">
        {variant === 'back' && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all hover:bg-surface-container-low active:scale-95"
            aria-label="חזרה"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        )}
        {variant !== 'back' && (
          <Lightbulb className="h-8 w-8 shrink-0 text-primary" aria-hidden />
        )}
        <Link
          to={ROUTES.home}
          className="truncate font-display text-headline-md font-bold text-on-surface"
        >
          {brandName}
        </Link>
      </div>

      {variant === 'ideas' && (
        <div className="mx-4 hidden max-w-xl flex-1 md:block">
          <div className="relative w-full">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="חיפוש רעיונות, צוותים או קטגוריות..."
              className="h-10 w-full rounded-full border-none bg-surface-container-low pr-12 pl-4 font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {variant === 'main' && (
        <nav className="hidden items-center gap-8 md:flex" aria-label="ניווט ראשי">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'rounded-lg px-3 py-2 font-label-md transition-colors duration-200',
                link.match(pathname)
                  ? 'text-primary'
                  : 'text-secondary hover:bg-surface-container-low',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        {connectedAs && (
          <span className="hidden font-label-md text-secondary md:block">
            מחובר כ<strong className="text-on-surface">{connectedAs}</strong>
          </span>
        )}
        {showShare && (
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 font-label-md text-primary transition-colors hover:bg-surface-container-high md:flex"
          >
            <Share2 className="h-5 w-5" />
            שיתוף
          </button>
        )}
        <button
          type="button"
          className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container-low active:scale-95"
          aria-label="התראות"
        >
          <Bell className="h-6 w-6 text-on-surface" />
        </button>
        <Link to={ROUTES.profile} title={user?.name}>
          <Avatar alt={user?.name ?? 'משתמש'} size="md" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full p-2 text-secondary transition-all hover:bg-surface-container-low hover:text-error active:scale-95"
          aria-label="יציאה"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
