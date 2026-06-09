import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/cn'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      aria-pressed={isDark}
      title={isDark ? 'מצב בהיר' : 'מצב כהה'}
      className={cn(
        'inline-flex items-center gap-2 border border-border-light p-1 transition-colors duration-300 hover:border-primary/50',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center transition-colors duration-300',
          !isDark && 'bg-primary text-on-primary',
          isDark && 'text-secondary',
        )}
        aria-hidden
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center transition-colors duration-300',
          isDark && 'bg-surface-container-lowest text-on-surface',
          !isDark && 'text-secondary',
        )}
        aria-hidden
      >
        <Moon className="h-4 w-4" />
      </span>
      {showLabel && (
        <span className="hidden pe-2 text-micro uppercase tracking-widest text-secondary sm:inline">
          {isDark ? 'כהה' : 'בהיר'}
        </span>
      )}
    </button>
  )
}
