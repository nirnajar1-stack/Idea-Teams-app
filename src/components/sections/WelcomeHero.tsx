import { Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { APP_NAME_FULL, ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { ACCESS_LEVEL_LABELS } from '../../types/user'

export function WelcomeHero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats } = useIdeas()

  return (
    <header className="lambo-hero animate-fade-up">
      <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="section-eyebrow">לוח בקרה</span>
          <h1 className="mb-4 font-display text-display-xl leading-[0.92] text-on-background">
            {user?.name}
          </h1>
          <p className="max-w-lg font-body text-body-lg text-secondary">
            ברוכים הבאים ל-{APP_NAME_FULL}
            {user?.accessLevel === 'guest'
              ? ` — כניסה כ${ACCESS_LEVEL_LABELS.guest}, רואים רק בקשות/רעיונות מסשן זה.`
              : '. בקשות/רעיונות חדשים נרשמים תחת שמך, עם תאריך יעד להתחלה ואפשרות שמירה ל-Inbox.'}
          </p>
          {stats.inboxCount > 0 && (
            <Link
              to={ROUTES.inbox}
              className="mt-8 inline-flex items-center gap-2 border border-border-light px-4 py-2 text-label-md text-on-surface transition-colors duration-300 hover:border-primary hover:text-primary"
            >
              {stats.inboxCount} בקשות/רעיונות ב-Inbox
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.addIdea)}
          className="btn-boutique inline-flex shrink-0 items-center gap-2"
        >
          <Plus className="h-5 w-5" aria-hidden />
          בקשה חדשה
        </button>
      </div>
      <div className="lambo-progress mt-10 max-w-xs" aria-hidden>
        <span className="w-1/3" />
      </div>
    </header>
  )
}
