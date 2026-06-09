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
    <div className="relative min-h-screen bg-background pb-24 md:pb-0">
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
