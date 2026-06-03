import {
  ArrowRight,
  Bell,
  Lightbulb,
  LogOut,
  Search,
  Share2,
  UserCog,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { canManageUsers } from '../../lib/permissions'
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
    match: (p: string) =>
      p.startsWith('/ideas') && p !== ROUTES.addIdea && !p.startsWith('/inbox'),
  },
  {
    to: ROUTES.inbox,
    label: 'Inbox',
    match: (p: string) => p === ROUTES.inbox,
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
  const { stats } = useIdeas()
  const showUserManagement = canManageUsers(user)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/50 bg-white/70 px-margin-mobile shadow-sm backdrop-blur-2xl md:px-margin-desktop">
      <div className="flex min-w-0 items-center gap-3">
        {variant === 'back' && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all hover:bg-primary/5 active:scale-95"
            aria-label="חזרה"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        )}
        {variant !== 'back' && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container shadow-glow">
            <Lightbulb className="h-5 w-5 text-on-primary" aria-hidden />
          </div>
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
              className="boutique-input h-10 rounded-full pr-12"
            />
          </div>
        </div>
      )}

      {variant === 'main' && (
        <nav className="hidden items-center gap-1 md:flex" aria-label="ניווט ראשי">
          {showUserManagement && (
            <Link
              to={ROUTES.users}
              className={cn(
                'relative flex items-center gap-1.5 rounded-xl px-3 py-2 font-label-md transition-colors duration-200',
                pathname === ROUTES.users
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-white/60 hover:text-on-surface',
              )}
            >
              <UserCog className="h-4 w-4" />
              משתמשים
            </Link>
          )}
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'relative rounded-xl px-3 py-2 font-label-md transition-colors duration-200',
                link.match(pathname)
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-white/60 hover:text-on-surface',
              )}
            >
              {link.label}
              {link.to === ROUTES.inbox && stats.inboxCount > 0 && (
                <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
                  {stats.inboxCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {connectedAs && (
          <span className="hidden font-label-md text-secondary md:block">
            מחובר כ<strong className="text-on-surface">{connectedAs}</strong>
          </span>
        )}
        {showShare && (
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-border-light/80 bg-white/50 px-4 py-2 font-label-md text-primary transition-colors hover:bg-white md:flex"
          >
            <Share2 className="h-5 w-5" />
            שיתוף
          </button>
        )}
        <button
          type="button"
          className="rounded-full p-2 transition-all duration-200 hover:bg-primary/5 active:scale-95"
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
          className="rounded-full p-2 text-secondary transition-all hover:bg-error/5 hover:text-error active:scale-95"
          aria-label="יציאה"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
