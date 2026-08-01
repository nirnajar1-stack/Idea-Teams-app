import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NAV_LABELS } from '../../constants/app'
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
  const [manageOpen, setManageOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const manageRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const manageActive = manageItems.some((item) => item.match(pathname))

  useLayoutEffect(() => {
    if (!manageOpen || !buttonRef.current) return

    const place = () => {
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      const menuWidth = menuRef.current?.offsetWidth || 208
      const padding = 8
      let left = rect.right - menuWidth
      if (left < padding) left = padding
      if (left + menuWidth > window.innerWidth - padding) {
        left = Math.max(padding, window.innerWidth - menuWidth - padding)
      }
      setMenuPos({ top: rect.bottom + 6, left })
    }

    place()
    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [manageOpen, compact, manageItems.length])

  useEffect(() => {
    if (!manageOpen) return
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (manageRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setManageOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setManageOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [manageOpen])

  useEffect(() => {
    setManageOpen(false)
  }, [pathname])

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
        <div ref={manageRef} className="relative shrink-0">
          <button
            ref={buttonRef}
            type="button"
            className={cn(
              'relative flex items-center rounded-full transition-colors duration-300',
              compact
                ? 'min-h-11 min-w-[4.25rem] flex-col justify-center gap-0.5 px-2.5 py-1.5'
                : 'gap-2 px-3.5 py-2 text-label-md',
              manageActive || manageOpen
                ? 'bg-primary text-on-primary shadow-boutique'
                : 'text-secondary hover:bg-surface-container hover:text-on-surface',
            )}
            aria-expanded={manageOpen}
            aria-haspopup="menu"
            aria-controls={menuId}
            onClick={() => setManageOpen((open) => !open)}
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
            {!compact && (
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', manageOpen && 'rotate-180')}
                aria-hidden
              />
            )}
          </button>

          {manageOpen &&
            createPortal(
              <div
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label={NAV_LABELS.manage}
                style={{ top: menuPos.top, left: menuPos.left }}
                className="fixed z-[80] min-w-[13rem] overflow-hidden rounded-2xl border border-border-light bg-surface-container-lowest py-1 shadow-card"
              >
                {manageItems.map((item) => {
                  const Icon = item.icon
                  const active = item.match(pathname)
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      role="menuitem"
                      className={cn(
                        'flex min-h-12 items-center gap-2 px-4 py-2 text-label-md transition-colors',
                        active
                          ? 'bg-surface-container text-on-surface'
                          : 'text-secondary hover:bg-surface-container-low hover:text-on-surface',
                      )}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setManageOpen(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  )
                })}
              </div>,
              document.body,
            )}
        </div>
      )}
    </div>
  )
}
