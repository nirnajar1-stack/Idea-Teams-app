import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchUserPreferences,
  loadLocalPreferences,
  upsertUserPreferences,
} from '../api/preferencesApi'
import { isSupabaseEnabled } from '../lib/supabaseClient'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '../types/preferences'
import { useAuth } from './AuthContext'

interface PreferencesContextValue {
  prefs: UserPreferences | null
  ready: boolean
  updatePrefs: (patch: Partial<Omit<UserPreferences, 'userId'>>) => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setPrefs(null)
      setReady(true)
      return
    }
    setReady(false)
    const load = isSupabaseEnabled()
      ? fetchUserPreferences(user.id)
      : Promise.resolve(loadLocalPreferences(user.id))
    void load
      .then(setPrefs)
      .catch(() => setPrefs({ userId: user.id, ...DEFAULT_USER_PREFERENCES }))
      .finally(() => setReady(true))
  }, [user])

  const updatePrefs = useCallback(
    async (patch: Partial<Omit<UserPreferences, 'userId'>>) => {
      if (!user || !prefs) return
      const next = { ...prefs, ...patch }
      setPrefs(next)
      await upsertUserPreferences(next)
    },
    [user, prefs],
  )

  const value = useMemo(
    () => ({ prefs, ready, updatePrefs }),
    [prefs, ready, updatePrefs],
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
