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
    <header className="lambo-hero animate-fade-up !pb-6 md:!pb-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl">
          <p className="section-eyebrow mb-1">שלום · {APP_NAME_FULL}</p>
          <h1 className="mb-2 font-display text-display-lg font-bold leading-[0.95] text-on-background md:text-display-xl">
            {user?.name}
          </h1>
          <p className="max-w-md font-body text-body-md text-secondary">
            {user?.accessLevel === 'guest'
              ? `כניסה כ${ACCESS_LEVEL_LABELS.guest} — נראים רק בקשות/רעיונות מהסשן הנוכחי.`
              : 'רישום, תעדוף ומעקב אחרי בקשות הצוות.'}
          </p>
          {stats.inboxCount > 0 && (
            <Link
              to={ROUTES.inbox}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface shadow-soft transition-colors duration-300 hover:bg-surface-container"
            >
              {stats.inboxCount} ב-Inbox
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={openQuickAdd}
          className="btn-boutique inline-flex min-h-12 shrink-0 items-center gap-2"
        >
          <Plus className="h-5 w-5" aria-hidden />
          בקשה חדשה
        </button>
      </div>
    </header>
  )
}
