import { Lightbulb } from 'lucide-react'
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <Lightbulb className="h-12 w-12 text-primary" aria-hidden />
        </div>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          {APP_NAME}
        </h1>
        <p className="max-w-md font-body-md text-secondary">
          בחרו משתמש כדי להיכנס. כל רעיון חדש יישמר עם שם היוצר שלכם.
        </p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-1 gap-6 sm:grid-cols-2">
        {USER_LIST.map((user) => (
          <UserLoginCard
            key={user.id}
            user={user}
            onSelect={() => handleLogin(user.id)}
          />
        ))}
      </div>

      <p className="mt-10 font-label-sm text-secondary">
        כניסה פנימית לצוות — ניר וגולן
      </p>

      <div
        className="pointer-events-none fixed top-20 right-[10%] -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-20 left-[10%] -z-10 h-96 w-96 rounded-full bg-surface-container-high/40 blur-[100px]"
        aria-hidden
      />
    </div>
  )
}
