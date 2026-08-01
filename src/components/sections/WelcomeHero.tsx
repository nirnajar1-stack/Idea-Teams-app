import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME_FULL, ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { useQuickAdd } from '../../context/QuickAddContext'
import { ACCESS_LEVEL_LABELS } from '../../types/user'

export function WelcomeHero() {
  const { openQuickAdd } = useQuickAdd()
  const { user } = useAuth()
  const { stats } = useIdeas()

  return (
    <header className="mb-5 animate-fade-up md:mb-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 text-right">
          <p className="section-eyebrow mb-0.5">שלום · {APP_NAME_FULL}</p>
          <h1 className="truncate font-display text-headline-lg font-bold text-on-background">
            {user?.name}
          </h1>
          <p className="mt-1 text-body-sm text-secondary">
            {user?.accessLevel === 'guest'
              ? `כניסה כ${ACCESS_LEVEL_LABELS.guest} — נראים רק בקשות/רעיונות מהסשן הנוכחי.`
              : 'רישום, תעדוף ומעקב אחרי בקשות הצוות.'}
            {stats.inboxCount > 0 && (
              <>
                {' · '}
                <Link to={ROUTES.inbox} className="font-label-md text-primary hover:underline">
                  {stats.inboxCount} ב-Inbox
                </Link>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openQuickAdd}
          className="btn-boutique inline-flex min-h-11 shrink-0 items-center gap-2 px-4"
        >
          <Plus className="h-4 w-4" aria-hidden />
          בקשה חדשה
        </button>
      </div>
    </header>
  )
}
