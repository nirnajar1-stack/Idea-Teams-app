import { Eye, EyeOff, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { APP_TAGLINE } from '../constants/app'
import { useAppRoutes, useEmbedMode } from '../context/EmbedModeContext'
import { useAuth } from '../context/AuthContext'
import { requestEmbedStorageAccess } from '../lib/embedMode'
import { ACCESS_LEVEL_LABELS } from '../types/user'
import { AppLogo } from '../components/ui/AppLogo'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, loginAsGuest } = useAuth()
  const { isEmbed } = useEmbedMode()
  const routes = useAppRoutes()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={routes.home} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (isEmbed) {
      await requestEmbedStorageAccess()
    }
    const result = await login(password)
    setLoading(false)
    if (result.ok) {
      navigate(routes.home)
    } else {
      setError(result.error ?? 'שגיאה בהתחברות')
    }
  }

  const handleGuest = async () => {
    if (isEmbed) {
      await requestEmbedStorageAccess()
    }
    loginAsGuest()
    navigate(routes.home)
  }

  if (isEmbed) {
    return (
      <div className="embed-shell flex min-h-screen min-h-dvh flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
          <AppLogo size="xs" showLabel />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="mb-8 max-w-md text-center">
            <span className="section-eyebrow mx-auto justify-center">כניסה — Power BI</span>
            <h1 className="mt-4 font-display text-display-md text-on-background">{APP_TAGLINE}</h1>
            <p className="mt-3 text-sm text-secondary">
              התחברו כדי לצפות בנתונים בתוך הדוח. אם הדפדפן חוסם שמירת סשן ב-iframe, אשרו גישה
              לעוגיות כשתתבקשו.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md border border-border-light bg-surface-container-lowest p-6 md:p-8"
          >
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-label-md uppercase text-on-surface">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-secondary transition-colors hover:text-on-surface"
                  aria-label={showPassword ? 'הסתר' : 'הצג'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 border border-error/40 bg-error-container/30 px-4 py-3 text-sm text-on-error-container">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-boutique w-full">
              {loading ? 'מזהה…' : 'כניסה'}
            </button>

            <div className="my-6 flex items-center gap-4">
              <hr className="flex-1 border-border-light" />
              <span className="text-micro uppercase tracking-widest text-secondary">או</span>
              <hr className="flex-1 border-border-light" />
            </div>

            <button type="button" onClick={handleGuest} className="btn-secondary-light w-full gap-2">
              <UserRound className="h-5 w-5" />
              כניסה כ{ACCESS_LEVEL_LABELS.guest}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="lambo-cinematic">
      <div className="lambo-cinematic__bg" aria-hidden />

      <div className="lambo-cinematic__content flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-margin-mobile py-6 md:px-margin-desktop">
          <AppLogo size="sm" showLabel />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-margin-mobile py-16 md:px-margin-desktop">
          <div className="mb-14 max-w-2xl animate-fade-up text-center">
            <span className="section-eyebrow mx-auto justify-center">כניסה למערכת</span>
            <h1 className="mt-6 font-display text-display-xl leading-[0.92] text-on-background">
              {APP_TAGLINE}
            </h1>
            <p className="mx-auto mt-6 max-w-md font-body text-body-lg text-secondary">
              הזינו את הסיסמה שלכם לכניסה, או היכנסו כ{ACCESS_LEVEL_LABELS.guest} לסשן זמני.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md animate-fade-up border border-border-light bg-surface-container-lowest/90 p-8 backdrop-blur-sm md:p-10"
            style={{ animationDelay: '100ms' }}
          >
            <div className="mb-8">
              <label
                htmlFor="password"
                className="mb-3 block text-label-md uppercase text-on-surface"
              >
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-secondary transition-colors hover:text-on-surface"
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
              <p className="mb-6 border border-error/40 bg-error-container/30 px-4 py-3 text-sm text-on-error-container">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-boutique w-full">
              {loading ? 'מזהה…' : 'כניסה'}
            </button>

            <div className="my-8 flex items-center gap-4">
              <hr className="flex-1 border-border-light" />
              <span className="text-micro uppercase tracking-widest text-secondary">או</span>
              <hr className="flex-1 border-border-light" />
            </div>

            <button type="button" onClick={handleGuest} className="btn-secondary-light w-full gap-2">
              <UserRound className="h-5 w-5" />
              כניסה כ{ACCESS_LEVEL_LABELS.guest}
            </button>
          </form>
        </div>

        <div className="lambo-progress mx-margin-mobile mb-8 md:mx-margin-desktop" aria-hidden>
          <span className="w-[38%]" />
        </div>
      </div>
    </div>
  )
}
