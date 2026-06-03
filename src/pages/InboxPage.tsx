import { Archive, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'

export function InboxPage() {
  const { getFilteredIdeas } = useIdeas()
  const inboxIdeas = getFilteredIdeas({
    search: '',
    categories: ['development', 'monitoring'],
    priority: null,
    pipeline: 'inbox',
  })

  return (
    <AppShell variant="main">
      <header className="mb-10 animate-fade-up">
        <span className="section-eyebrow border-inbox/20 bg-inbox-soft text-inbox">
          <Archive className="h-3.5 w-3.5" />
          Inbox
        </span>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          אולי בהמשך
        </h1>
        <p className="max-w-2xl font-body-md text-secondary">
          רעיונות ששמרתם לבחינה עתידית — בלי לחץ ביצוע. כשתהיו מוכנים, העבירו אותם
          חזרה ללוח הפעיל ממסך הפרטים.
        </p>
        <Link
          to={ROUTES.ideas}
          className="mt-4 inline-flex items-center gap-1 font-label-md text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה לרעיונות פעילים
        </Link>
      </header>

      {inboxIdeas.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Archive className="mx-auto mb-4 h-12 w-12 text-inbox/50" />
          <p className="font-body-lg text-on-surface">ה-Inbox ריק כרגע</p>
          <p className="mt-2 font-body-md text-secondary">
            בעת הוספת רעיון, סמנו &quot;שלח ל-Inbox — אולי בהמשך&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inboxIdeas.map((idea, i) => (
            <div
              key={idea.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <IdeaListCard idea={idea} />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
