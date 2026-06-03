import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Navbar, type NavbarProps } from './Navbar'
import { cn } from '../../lib/cn'

export interface AppShellProps extends NavbarProps {
  children: ReactNode
  maxWidth?: 'default' | 'narrow' | 'full'
}

export function AppShell({
  children,
  maxWidth = 'default',
  ...navbarProps
}: AppShellProps) {
  const maxWidthClass = {
    default: 'max-w-container-max',
    narrow: 'max-w-[800px]',
    full: 'max-w-container-max',
  }[maxWidth]

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar {...navbarProps} />
      <main
        className={cn(
          'mx-auto px-margin-mobile pb-12 pt-24 md:px-margin-desktop',
          maxWidthClass,
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
