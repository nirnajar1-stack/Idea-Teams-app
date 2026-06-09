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
  loginWithPasswordCloud,
  restoreSupabaseSession,
  signInSupabaseAuth,
  signOutSupabaseAuth,
} from '../api/authApi'
import { isSupabaseEnabled } from '../lib/supabaseClient'
import { GUEST_USER_ID } from '../data/defaultUsers'
import { SESSION_STORAGE_KEY } from '../constants/app'
import { storedToAppUser, useUsers } from './UsersContext'
import type { AppUser, AuthSession } from '../types/user'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  login: (password: string) => Promise<{ ok: boolean; error?: string }>
  loginAsGuest: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    if (raw === 'nir' || raw === 'golan') {
      return { userId: raw }
    }
    const parsed = JSON.parse(raw) as AuthSession
    if (parsed?.userId) return parsed
  } catch {
    /* ignore */
  }
  return null
}

function saveSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function newGuestSessionId(): string {
  return `gs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getUserById, findUserByPassword } = useUsers()
  const [session, setSession] = useState<AuthSession | null>(loadSession)

  useEffect(() => {
    if (isSupabaseEnabled()) void restoreSupabaseSession()
  }, [])

  const user = useMemo((): AppUser | null => {
    if (!session) return null
    const stored = getUserById(session.userId)
    if (!stored || !stored.active) return null
    return storedToAppUser(stored, session.guestSessionId)
  }, [session, getUserById])

  const login = useCallback(
    async (password: string) => {
      const trimmed = password.trim()
      if (!trimmed) {
        return { ok: false, error: 'יש להזין סיסמה' }
      }

      if (isSupabaseEnabled()) {
        const cloud = await loginWithPasswordCloud(trimmed)
        if (cloud.error === 'ambiguous') {
          const who = cloud.conflictNames?.trim()
          return {
            ok: false,
            error: who
              ? `סיסמה זו משויכת ליותר ממשתמש אחד (${who}). כל משתמש חייב סיסמה ייחודית — פנו למנהל לשינוי.`
              : 'סיסמה זו משויכת ליותר ממשתמש אחד. כל משתמש חייב סיסמה ייחודית — פנו למנהל.',
          }
        }
        if (cloud.ok && cloud.userId) {
          await signOutSupabaseAuth()
          if (cloud.email) {
            await signInSupabaseAuth(cloud.email, trimmed)
          }
          const next: AuthSession = { userId: cloud.userId }
          saveSession(next)
          setSession(next)
          return { ok: true }
        }
        if (cloud.error === 'invalid') {
          return { ok: false, error: 'סיסמה שגויה' }
        }
      }

      const account = await findUserByPassword(trimmed)
      if (account.kind === 'ambiguous') {
        return {
          ok: false,
          error: `סיסמה זו משויכת ליותר ממשתמש אחד (${account.names}). כל משתמש חייב סיסמה ייחודית — פנו למנהל לשינוי.`,
        }
      }
      if (account.kind === 'not_found') {
        return { ok: false, error: 'סיסמה שגויה' }
      }
      const next: AuthSession = { userId: account.user.id }
      saveSession(next)
      setSession(next)
      return { ok: true }
    },
    [findUserByPassword],
  )

  const loginAsGuest = useCallback(() => {
    const guestSessionId = newGuestSessionId()
    const next: AuthSession = {
      userId: GUEST_USER_ID,
      guestSessionId,
    }
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    void signOutSupabaseAuth()
    saveSession(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      loginAsGuest,
      logout,
    }),
    [user, login, loginAsGuest, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
