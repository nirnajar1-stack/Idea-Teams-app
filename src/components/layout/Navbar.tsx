import { useState } from 'react'
import { ArrowRight, LogOut, Search, Share2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { APP_NAME_FULL, ROUTES } from '../../constants/app'
import { buildNavContext, splitVisibleNavItems } from '../../config/appNavigation'
import { useAuth } from '../../context/AuthContext'
import { useGroups } from '../../context/GroupsContext'
import { useIdeas } from '../../context/IdeasContext'
import { usePermissions } from '../../context/PermissionsContext'
import { useQuickAdd } from '../../context/QuickAddContext'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useNavbarScroll } from '../../hooks/useNavbarScroll'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { AppLogo } from '../ui/AppLogo'
import { NotificationBell } from '../chat/NotificationBell'
import { GlobalSearchModal } from '../search/GlobalSearchModal'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NavTabs } from './NavTabs'

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

export function Navbar({
  variant = 'main',
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
  const { myGroupIds } = useGroups()
  const { rulesByKey } = usePermissions()
  const { openQuickAdd } = useQuickAdd()
  const [searchOpen, setSearchOpen] = useState(false)
  const scrolled = useNavbarScroll()

  const { primary: primaryNavItems, manage: manageNavItems } = splitVisibleNavItems(
    buildNavContext(user, myGroupIds, rulesByKey),
  )

  const showMainNav = variant === 'main' || variant === 'ideas'

  useKeyboardShortcuts({
    onSearchOpen: () => setSearchOpen(true),
    onQuickAdd: openQuickAdd,
  })

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: APP_NAME_FULL, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('הקישור הועתק')
    } catch {
      toast.error('לא ניתן לשתף כרגע')
    }
  }

  return (
    <header
      className={cn(
        'nav-glass fixed top-0 z-50 w-full',
        scrolled && 'nav-glass--scrolled',
      )}
    >
      <div className="nav-glass__scanline" aria-hidden />
      <div className="flex h-14 items-center justify-between px-margin-mobile md:h-16 md:px-margin-desktop">
        <div className="flex min-w-0 items-center gap-3">
          {variant === 'back' && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="icon-chip"
              aria-label="חזרה"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          )}
          <Link to={ROUTES.home} className="min-w-0 shrink-0" title={APP_NAME_FULL}>
            <AppLogo size="md" showLabel />
          </Link>
        </div>

        {showMainNav && (
          <div className="mx-2 hidden min-w-0 flex-1 md:block">
            <NavTabs
              items={primaryNavItems.filter((item) => item.id !== 'profile')}
              manageItems={manageNavItems}
              pathname={pathname}
              inboxCount={stats.inboxCount}
            />
          </div>
        )}

        {variant === 'ideas' && (
          <div className="mx-2 hidden max-w-sm flex-1 lg:block">
            <div className="relative w-full">
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="חיפוש בקשות/רעיונות..."
                className="boutique-input h-11 bg-surface-container-low pr-12"
              />
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {(variant === 'main' || variant === 'ideas') && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-secondary transition-colors duration-300 hover:text-on-surface"
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
              className="btn-secondary-light hidden gap-2 md:inline-flex"
            >
              <Share2 className="h-5 w-5" />
              שיתוף
            </button>
          )}
          <ThemeToggle />
          <NotificationBell />
          <Link to={ROUTES.profile} title={user?.name} className="block">
            <Avatar alt={user?.name ?? 'משתמש'} size="md" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-secondary transition-colors duration-300 hover:text-error"
            aria-label="יציאה"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* מובייל: מעבר דפים עם תוויות ברורות */}
      {showMainNav && (
        <div className="border-t border-border-light/80 px-2 pb-2 pt-1 md:hidden">
          <NavTabs
            items={primaryNavItems.filter((item) => item.id !== 'profile')}
            manageItems={manageNavItems}
            pathname={pathname}
            inboxCount={stats.inboxCount}
            compact
          />
        </div>
      )}

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
