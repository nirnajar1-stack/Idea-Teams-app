import { Archive, ArrowLeft, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { IdeasListToolbar } from '../components/sections/IdeasListToolbar'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'
import { loadIdeasViewPrefs, saveIdeasViewPrefs } from '../lib/ideasViewPrefs'
import { filterIdeas, sortIdeas } from '../lib/ideaUtils'
import type { IdeasViewPrefs } from '../types/idea'

export function InboxPage() {
  const { visibleIdeas, updateIdea } = useIdeas()
  const [search, setSearch] = useState('')
  const [viewPrefs, setViewPrefs] = useState<IdeasViewPrefs>(loadIdeasViewPrefs)

  const inboxIdeas = useMemo(
    () =>
      sortIdeas(
        filterIdeas(visibleIdeas, {
          search,
          categories: ['development', 'monitoring'],
          priority: null,
          pipeline: 'inbox',
        }),
        viewPrefs.sort,
      ),
    [visibleIdeas, search, viewPrefs.sort],
  )

  const updateViewPrefs = useCallback((patch: Partial<IdeasViewPrefs>) => {
    setViewPrefs((prev) => {
      const next = { ...prev, ...patch }
      saveIdeasViewPrefs(next)
      return next
    })
  }, [])

  const handleRestore = useCallback(
    (ideaId: string) => {
      void updateIdea(ideaId, { sendToMaybeInbox: false })
    },
    [updateIdea],
  )

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
          רעיונות ששמרתם לבחינה עתידית — בלי לחץ ביצוע. החזירו אותם ללוח הפעיל בלחיצה
          אחת.
        </p>
        <Link
          to={ROUTES.ideas}
          className="mt-4 inline-flex items-center gap-1 font-label-md text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה לרעיונות פעילים
        </Link>
      </header>

      <div className="mb-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש ב-Inbox..."
            className="boutique-input h-12 w-full rounded-xl pr-12"
          />
        </div>
      </div>

      <IdeasListToolbar
        sort={viewPrefs.sort}
        onSortChange={(sort) => updateViewPrefs({ sort })}
        compact={viewPrefs.compact}
        onCompactChange={(compact) => updateViewPrefs({ compact })}
        activeCount={inboxIdeas.length}
        completedCount={0}
      />

      {inboxIdeas.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Archive className="mx-auto mb-4 h-12 w-12 text-inbox/50" />
          <p className="font-body-lg text-on-surface">ה-Inbox ריק כרגע</p>
          <p className="mt-2 font-body-md text-secondary">
            בעת הוספת רעיון, סמנו &quot;שלח ל-Inbox — אולי בהמשך&quot;
          </p>
        </div>
      ) : (
        <div className={viewPrefs.compact ? 'space-y-2' : 'space-y-4'}>
          {inboxIdeas.map((idea, i) => (
            <div
              key={idea.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <IdeaListCard
                idea={idea}
                compact={viewPrefs.compact}
                showInboxActions
                onRestoreFromInbox={handleRestore}
              />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
