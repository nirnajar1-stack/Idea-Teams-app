import { useState } from 'react'
import {
  ArrowRight,
  Lightbulb,
  LogOut,
  Search,
  Share2,
  UserCog,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { APP_NAME, NAV_LABELS, ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { canManageUsers } from '../../lib/permissions'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { NotificationBell } from '../chat/NotificationBell'
import { GlobalSearchModal } from '../search/GlobalSearchModal'
import { ThemeToggle } from '../ui/ThemeToggle'

export type NavbarVariant = 'main' | 'back' | 'ideas'

export interface NavbarProps {
  variant?: NavbarVariant
  brandName?: string
  connectedAs?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showShare?: boolean
  shareUrl?: string
}

const mainLinks = [
  { to: ROUTES.home, label: NAV_LABELS.home, match: (p: string) => p === ROUTES.home },
  {
    to: ROUTES.ideas,
    label: NAV_LABELS.ideas,
    match: (p: string) =>
      p.startsWith('/ideas') && p !== ROUTES.addIdea && p !== ROUTES.inbox,
  },
  {
    to: ROUTES.inbox,
    label: NAV_LABELS.inbox,
    match: (p: string) => p === ROUTES.inbox,
  },
  { to: ROUTES.profile, label: NAV_LABELS.profile, match: (p: string) => p === ROUTES.profile },
]

function NavLinks({
  pathname,
  inboxCount,
  compact = false,
}: {
  pathname: string
  inboxCount: number
  compact?: boolean
}) {
  return (
    <>
      {mainLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={cn(
            'relative rounded-xl font-label-md transition-colors duration-200',
            compact ? 'px-2 py-1.5 text-label-sm' : 'px-3 py-2',
            link.match(pathname)
              ? 'bg-primary/10 text-primary'
              : 'text-secondary hover:bg-primary/5 hover:text-on-surface',
          )}
        >
          {link.label}
          {link.to === ROUTES.inbox && inboxCount > 0 && (
            <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-inbox px-1 text-[10px] font-bold text-white">
              {inboxCount}
            </span>
          )}
        </Link>
      ))}
    </>
  )
}

export function Navbar({
  variant = 'main',
  brandName = APP_NAME,
  connectedAs,
  searchValue = '',
  onSearchChange,
  showShare = false,
  shareUrl,
}: NavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { stats } = useIdeas()
  const [searchOpen, setSearchOpen] = useState(false)
  const showUserManagement = canManageUsers(user)

  useKeyboardShortcuts({ onSearchOpen: () => setSearchOpen(true) })

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: APP_NAME, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('הקישור הועתק')
    } catch {
      toast.error('לא ניתן לשתף כרגע')
    }
  }

  return (
    <header className="nav-glass fixed top-0 z-50 flex h-16 w-full items-center justify-between px-margin-mobile md:px-margin-desktop">
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

      {(variant === 'ideas' || variant === 'main') && (
        <nav
          className={cn(
            'mx-2 hidden items-center gap-0.5 md:flex',
            variant === 'ideas' && 'max-w-none flex-1 justify-center',
          )}
          aria-label="ניווט ראשי"
        >
          {showUserManagement && variant === 'main' && (
            <Link
              to={ROUTES.users}
              className={cn(
                'relative flex items-center gap-1.5 rounded-xl px-3 py-2 font-label-md transition-colors duration-200',
                pathname === ROUTES.users
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-primary/5 hover:text-on-surface',
              )}
            >
              <UserCog className="h-4 w-4" />
              {NAV_LABELS.users}
            </Link>
          )}
          <NavLinks
            pathname={pathname}
            inboxCount={stats.inboxCount}
            compact={variant === 'ideas'}
          />
        </nav>
      )}

      {variant === 'ideas' && (
        <div className="mx-2 hidden max-w-sm flex-1 lg:block">
          <div className="relative w-full">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="חיפוש רעיונות..."
              className="boutique-input h-10 rounded-full pr-12"
            />
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {(variant === 'main' || variant === 'ideas') && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 text-secondary transition-all hover:bg-primary/5 hover:text-primary"
            aria-label="חיפוש גלובלי ( / )"
            title="חיפוש ( / )"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        {connectedAs && (
          <span className="hidden font-label-md text-secondary lg:block">
            מחובר כ<strong className="text-on-surface">{connectedAs}</strong>
          </span>
        )}
        {showShare && (
          <button
            type="button"
            onClick={() => void handleShare()}
            className="hidden items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2 font-label-md text-primary transition-colors hover:border-primary/30 hover:bg-primary/10 md:flex"
          >
            <Share2 className="h-5 w-5" />
            שיתוף
          </button>
        )}
        <ThemeToggle />
        <NotificationBell />
        <Link to={ROUTES.profile} title={user?.name} className="hidden sm:block">
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
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
