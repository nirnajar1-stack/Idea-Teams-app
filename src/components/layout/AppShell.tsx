import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Footer } from './Footer'
import { Navbar, type NavbarProps } from './Navbar'
import { cn } from '../../lib/cn'

export interface AppShellProps extends Omit<NavbarProps, 'connectedAs'> {
  children: ReactNode
  maxWidth?: 'default' | 'narrow' | 'full'
  connectedAs?: string
  shareUrl?: string
}

export function AppShell({
  children,
  maxWidth = 'default',
  connectedAs,
  shareUrl,
  ...navbarProps
}: AppShellProps) {
  const { user } = useAuth()
  const maxWidthClass = {
    default: 'max-w-container-max',
    narrow: 'max-w-[800px]',
    full: 'max-w-container-max',
  }[maxWidth]

  return (
    <div className="relative min-h-screen pb-24 md:pb-0">
      <div className="ambient-orb right-[5%] top-24 h-72 w-72 bg-glow/15" aria-hidden />
      <div className="ambient-orb bottom-32 left-[8%] h-96 w-96 bg-accent/12" aria-hidden />
      <div
        className="ambient-orb left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 bg-primary/8"
        aria-hidden
      />

      <Navbar connectedAs={connectedAs ?? user?.name} shareUrl={shareUrl} {...navbarProps} />
      <main
        className={cn(
          'relative mx-auto px-margin-mobile pb-12 pt-[7.25rem] md:px-margin-desktop md:pt-24',
          maxWidthClass,
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
