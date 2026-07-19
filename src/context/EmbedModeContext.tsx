import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { getAppRoutes } from '../lib/appRoutes'
import { isEmbedMode } from '../lib/embedMode'

interface EmbedModeContextValue {
  isEmbed: boolean
  routes: ReturnType<typeof getAppRoutes>
}

const EmbedModeContext = createContext<EmbedModeContextValue | null>(null)

export function EmbedModeProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const isEmbed = isEmbedMode(pathname, search)
  const routes = useMemo(() => getAppRoutes(isEmbed), [isEmbed])

  useEffect(() => {
    document.documentElement.classList.toggle('embed-mode', isEmbed)
    return () => {
      document.documentElement.classList.remove('embed-mode')
    }
  }, [isEmbed])

  const value = useMemo(() => ({ isEmbed, routes }), [isEmbed, routes])

  return (
    <EmbedModeContext.Provider value={value}>{children}</EmbedModeContext.Provider>
  )
}

export function useEmbedMode(): EmbedModeContextValue {
  const ctx = useContext(EmbedModeContext)
  if (!ctx) {
    throw new Error('useEmbedMode must be used within EmbedModeProvider')
  }
  return ctx
}

/** נתיבים מותאמים ל-embed כשפעיל, אחרת הנתיבים הרגילים */
export function useAppRoutes() {
  return useEmbedMode().routes
}
