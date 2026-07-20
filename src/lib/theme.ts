export type Theme = 'light' | 'dim' | 'dark'

export const THEME_STORAGE_KEY = 'ideaflow-theme-v1'

const THEME_COLORS: Record<Theme, string> = {
  light: '#f8f8f8',
  dim: '#e3d8c8',
  dark: '#000000',
}

export function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dim' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return null
}

export function resolveInitialTheme(): Theme {
  const stored = getStoredTheme()
  if (stored) return stored
  return 'light'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'dim')
  if (theme === 'dark') root.classList.add('dark')
  if (theme === 'dim') root.classList.add('dim')
  root.dataset.theme = theme
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = THEME_COLORS[theme]
}
