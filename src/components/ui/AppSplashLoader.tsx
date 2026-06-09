import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { APP_NAME_FULL } from '../../constants/app'
import { AppLogo } from './AppLogo'

export interface AppSplashLoaderProps {
  exiting?: boolean
}

export function AppSplashLoader({ exiting = false }: AppSplashLoaderProps) {
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 8))
    }, 280)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={cn(
        'app-splash fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-background transition-opacity duration-500',
        exiting && 'pointer-events-none opacity-0',
      )}
      role="status"
      aria-live="polite"
      aria-label={`טוען את ${APP_NAME_FULL}`}
    >
      <div className="app-splash-orb app-splash-orb-a" />
      <div className="app-splash-orb app-splash-orb-b" />

      <div className="relative flex flex-col items-center gap-10 px-6">
        <AppLogo size="xl" imageOnly className="app-splash-logo" />

        <div className="text-center">
          <p className="text-micro uppercase tracking-[0.2em] text-secondary">טוען מערכת</p>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            בקשות/רעיונות וצוות…
          </p>
        </div>

        <div className="w-48">
          <div className="lambo-progress">
            <span style={{ width: exiting ? '100%' : `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
