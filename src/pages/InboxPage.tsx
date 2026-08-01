import { Archive, ArrowLeft, Rocket, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { IdeasListToolbar } from '../components/sections/IdeasListToolbar'
import { EmptyState } from '../components/ui/EmptyState'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'
import { cn } from '../lib/cn'
import { loadIdeasViewPrefs, saveIdeasViewPrefs } from '../lib/ideasViewPrefs'
import { filterIdeas, sortIdeas } from '../lib/ideaUtils'
import { IDEA_SOURCES, type IdeasViewPrefs } from '../types/idea'

export function InboxPage() {
  const { visibleIdeas, updateIdea } = useIdeas()
  const [search, setSearch] = useState('')
  const [viewPrefs, setViewPrefs] = useState<IdeasViewPrefs>(loadIdeasViewPrefs)

  const inboxIdeas = useMemo(
    () =>
      sortIdeas(
        filterIdeas(visibleIdeas, {
          search,
          categories: ['development', 'monitoring', 'technical'],
          sources: [...IDEA_SOURCES],
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
      <header className="mb-5 animate-fade-up md:mb-6">
        <span className="section-eyebrow border-inbox/20 bg-inbox-soft text-inbox">
          <Archive className="h-3.5 w-3.5" />
          Inbox
        </span>
        <h1 className="mt-1 font-display text-headline-lg text-on-surface">אולי בהמשך</h1>
        <p className="mt-1 max-w-xl text-body-sm text-secondary">
          כאן נשמרות בקשות שלא לטיפול עכשיו. הצעד הבא: החזרה לפעילות או סגירה מהכרטיס.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-label-sm text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Rocket className="h-3.5 w-3.5 text-primary" aria-hidden />
            החזר לפעילים
          </span>
          <Link to={ROUTES.ideas} className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            לרשימה הפעילה
          </Link>
        </div>
      </header>

      <div className="mb-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש ב-Inbox..."
            className="boutique-input h-11 w-full pr-12"
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
        <div className="rounded-[1.35rem] bg-surface-container-lowest p-6 shadow-soft">
          <EmptyState
            title="ה-Inbox ריק"
            description="כשבקשה לא רלוונטית עכשיו — שלחו אותה לכאן מתוך כרטיס הבקשה. אחר כך אפשר להחזיר לפעילים בלחיצה."
            action={
              <Link to={ROUTES.ideas} className="btn-boutique">
                לרשימת הבקשות
              </Link>
            }
          />
        </div>
      ) : (
        <div className={cn('list-stagger', viewPrefs.compact ? 'space-y-2' : 'space-y-3')}>
          {inboxIdeas.map((idea) => (
            <IdeaListCard
              key={idea.id}
              idea={idea}
              compact={viewPrefs.compact}
              showInboxActions
              onRestoreFromInbox={handleRestore}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
