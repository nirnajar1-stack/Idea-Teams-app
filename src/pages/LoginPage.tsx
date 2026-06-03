import { Lightbulb, Sparkles } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../constants/app'
import { useAuth, USER_LIST } from '../context/AuthContext'
import { UserLoginCard } from '../components/ui/UserLoginCard'
import type { UserId } from '../types/user'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  const handleLogin = (userId: UserId) => {
    login(userId)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-margin-mobile py-12 md:px-margin-desktop">
      <div className="ambient-orb right-[10%] top-16 h-80 w-80 bg-primary/15" />
      <div className="ambient-orb bottom-16 left-[5%] h-96 w-96 bg-inbox/10" />

      <div className="relative mb-12 max-w-lg animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-boutique">
          <Lightbulb className="h-8 w-8 text-on-primary" aria-hidden />
        </div>
        <span className="section-eyebrow mx-auto">
          <Sparkles className="h-3.5 w-3.5" />
          FacilPay Studio
        </span>
        <h1 className="mb-3 font-display text-headline-lg text-on-surface">
          {APP_NAME}
        </h1>
        <p className="font-body-md text-secondary">
          בחרו משתמש כדי להיכנס. כל רעיון נשמר עם יוצר, תאריך יעד להתחלה ואפשרות
          Inbox ל&quot;אולי בהמשך&quot;.
        </p>
      </div>

      <div className="relative grid w-full max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
        {USER_LIST.map((user, i) => (
          <div
            key={user.id}
            className="animate-fade-up"
            style={{ animationDelay: `${100 + i * 80}ms` }}
          >
            <UserLoginCard user={user} onSelect={() => handleLogin(user.id)} />
          </div>
        ))}
      </div>

      <p className="relative mt-12 font-label-sm text-secondary">
        כניסה פנימית — ניר וגולן
      </p>
    </div>
  )
}
