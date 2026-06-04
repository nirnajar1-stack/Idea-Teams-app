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
        'inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-container-low p-1 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 active:scale-95',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
          !isDark && 'bg-primary/15 text-primary shadow-sm',
          isDark && 'text-secondary',
        )}
        aria-hidden
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
          isDark && 'bg-primary/15 text-primary shadow-sm',
          !isDark && 'text-secondary',
        )}
        aria-hidden
      >
        <Moon className="h-4 w-4" />
      </span>
      {showLabel && (
        <span className="hidden pe-2 text-label-sm text-secondary sm:inline">
          {isDark ? 'כהה' : 'בהיר'}
        </span>
      )}
    </button>
  )
}
