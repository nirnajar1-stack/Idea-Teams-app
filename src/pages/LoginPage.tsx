import { Eye, EyeOff, Sparkles, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { APP_TAGLINE, ROUTES } from '../constants/app'
import { useAuth } from '../context/AuthContext'
import { ACCESS_LEVEL_LABELS } from '../types/user'
import { cn } from '../lib/cn'
import { AppLogo } from '../components/ui/AppLogo'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, loginAsGuest } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await login(password)
    setLoading(false)
    if (result.ok) {
      navigate(ROUTES.home)
    } else {
      setError(result.error ?? 'שגיאה בהתחברות')
    }
  }

  const handleGuest = () => {
    loginAsGuest()
    navigate(ROUTES.home)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-margin-mobile py-12 md:px-margin-desktop">
      <div className="fixed top-4 start-4 z-50">
        <ThemeToggle />
      </div>
      <div className="ambient-orb right-[10%] top-16 h-80 w-80 bg-primary/15" />
      <div className="ambient-orb bottom-16 left-[5%] h-96 w-96 bg-inbox/10" />

      <div className="relative mb-10 max-w-sm animate-fade-up text-center">
        <AppLogo size="xl" imageOnly className="mx-auto mb-6" />
        <span className="section-eyebrow mx-auto font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {APP_TAGLINE}
        </span>
        <p className="mt-4 font-body-md text-secondary">
          הזינו את הסיסמה שלכם לכניסה, או היכנסו כ{ACCESS_LEVEL_LABELS.guest} לסשן
          זמני.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="tech-surface relative w-full max-w-md animate-fade-up glass-card p-8"
        style={{ animationDelay: '80ms' }}
      >
        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block font-label-md text-on-surface">
            סיסמה
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="boutique-input pl-12"
              placeholder="הזינו סיסמה"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-secondary hover:bg-primary/5"
              aria-label={showPassword ? 'הסתר' : 'הצג'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-error/20 bg-error-container/50 px-4 py-3 font-label-md text-on-error-container">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-boutique w-full">
          {loading ? 'מזהה…' : 'כניסה'}
        </button>

        <div className="my-6 flex items-center gap-3">
          <hr className="flex-1 border-border-light/80" />
          <span className="font-label-sm text-secondary">או</span>
          <hr className="flex-1 border-border-light/80" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border border-border-light',
            'bg-surface-container-low/80 py-3.5 font-label-md text-on-surface backdrop-blur-md transition-all',
            'hover:border-inbox/30 hover:bg-inbox-soft/60 active:scale-[0.98]',
          )}
        >
          <UserRound className="h-5 w-5 text-inbox" />
          כניסה כ{ACCESS_LEVEL_LABELS.guest}
        </button>
      </form>
    </div>
  )
}
