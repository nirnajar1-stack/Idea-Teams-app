import { cn } from '../../lib/cn'
import { APP_NAME_FULL } from '../../constants/app'
import { AppLogo } from './AppLogo'

export interface AppSplashLoaderProps {
  /** true when data is ready — triggers exit animation */
  exiting?: boolean
}

export function AppSplashLoader({ exiting = false }: AppSplashLoaderProps) {
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
      <div className="app-splash-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="app-splash-orb app-splash-orb-a" />
      <div className="app-splash-orb app-splash-orb-b" />

      <div className="relative flex flex-col items-center gap-8">
        <div className="app-splash-ring-wrap relative flex h-44 w-44 items-center justify-center">
          <div className="app-splash-ring app-splash-ring-outer" />
          <div className="app-splash-ring app-splash-ring-inner" />
          <AppLogo size="xl" imageOnly className="relative z-10 drop-shadow-lg" />
        </div>

        <div className="text-center">
          <p className="font-body-md text-secondary">טוען בקשות/רעיונות וצוות…</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="app-splash-dot h-2 w-2 rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
