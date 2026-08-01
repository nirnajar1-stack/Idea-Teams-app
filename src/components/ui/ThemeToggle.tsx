import { Contrast, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import type { Theme } from '../../lib/theme'
import { cn } from '../../lib/cn'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'בהיר', icon: Sun },
  { id: 'dim', label: 'ביניים', icon: Contrast },
  { id: 'dark', label: 'כהה', icon: Moon },
]

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border-light bg-surface-container-lowest p-1 shadow-soft',
        className,
      )}
      role="group"
      aria-label="מצב תצוגה"
    >
      {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = theme === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 sm:h-9 sm:w-9',
              active
                ? 'bg-primary text-on-primary shadow-boutique'
                : 'text-secondary hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        )
      })}
      {showLabel && (
        <span className="hidden pe-2 text-micro font-medium tracking-wide text-secondary sm:inline">
          {THEME_OPTIONS.find((o) => o.id === theme)?.label}
        </span>
      )}
    </div>
  )
}
