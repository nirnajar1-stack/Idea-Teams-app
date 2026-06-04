export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ideaflow-theme-v1'

const THEME_COLORS: Record<Theme, string> = {
  light: '#f0f4fa',
  dark: '#060a12',
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return null
}

export function resolveInitialTheme(): Theme {
  const stored = getStoredTheme()
  if (stored) return stored
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = THEME_COLORS[theme]
}
