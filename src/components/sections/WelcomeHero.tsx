import { Plus, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'

export function WelcomeHero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats } = useIdeas()

  return (
    <header className="mb-10 animate-fade-up">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            לוח בקרה
          </span>
          <h1 className="mb-2 font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">
            שלום, {user?.name}
          </h1>
          <p className="max-w-lg font-body-md text-secondary">
            ברוכים הבאים ל-IdeaFlow. רעיונות חדשים נרשמים תחת שמך, עם תאריך יעד
            להתחלה ואפשרות שמירה ל-Inbox.
          </p>
          {stats.inboxCount > 0 && (
            <Link
              to={ROUTES.inbox}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-inbox/25 bg-inbox-soft px-4 py-2 font-label-md text-inbox transition-colors hover:bg-inbox/15"
            >
              {stats.inboxCount} רעיונות ב-Inbox · אולי בהמשך
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.addIdea)}
          className="btn-boutique inline-flex shrink-0 items-center gap-2"
        >
          <Plus className="h-5 w-5" aria-hidden />
          רעיון חדש
        </button>
      </div>
    </header>
  )
}
