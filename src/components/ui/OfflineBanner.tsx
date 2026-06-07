import { CloudOff, RefreshCw, WifiOff } from 'lucide-react'
import { useIdeas } from '../../context/IdeasContext'
import { cn } from '../../lib/cn'

export function OfflineBanner() {
  const { loadError, usingCloud, cloudConfigured } = useIdeas()

  if (!loadError && (usingCloud || !cloudConfigured)) return null

  const isOffline = loadError?.includes('מקומית') || loadError?.includes('חיבור')
  const Icon = isOffline ? WifiOff : CloudOff

  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center gap-2 border-b px-4 py-2.5 text-center font-label-sm',
        isOffline
          ? 'border-inbox/30 bg-inbox-soft/60 text-inbox'
          : 'border-error/30 bg-error-container/50 text-on-error-container',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{loadError ?? 'פועלים במצב מקומי'}</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 underline hover:no-underline"
      >
        <RefreshCw className="h-3 w-3" />
        רענון
      </button>
    </div>
  )
}
