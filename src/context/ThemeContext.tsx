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
  applyTheme,
  getStoredTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '../lib/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
      const boot = document.documentElement.dataset.theme
      if (boot === 'light' || boot === 'dim' || boot === 'dark') return boot
    }
    return resolveInitialTheme()
  })

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const order: Theme[] = ['light', 'dim', 'dark']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }, [theme, setTheme])

  useEffect(() => {
    const stored = getStoredTheme()
    const initial = stored ?? resolveInitialTheme()
    setThemeState(initial)
    applyTheme(initial)
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
