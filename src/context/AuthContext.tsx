import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SESSION_STORAGE_KEY } from '../constants/app'
import { getUserById, USER_LIST } from '../data/users'
import type { AppUser, UserId } from '../types/user'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  login: (userId: UserId) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): UserId | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (raw === 'nir' || raw === 'golan') return raw
  } catch {
    /* ignore */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UserId | null>(loadSession)

  const user = userId ? getUserById(userId) : null

  const login = useCallback((id: UserId) => {
    localStorage.setItem(SESSION_STORAGE_KEY, id)
    setUserId(id)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUserId(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
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

export { USER_LIST }
