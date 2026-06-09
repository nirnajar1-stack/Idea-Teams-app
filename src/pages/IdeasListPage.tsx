import { Plus, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { CompletedIdeasSection } from '../components/sections/CompletedIdeasSection'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { IdeasExportModal } from '../components/sections/IdeasExportModal'
import { IdeasFiltersPanel } from '../components/sections/IdeasFiltersPanel'
import { IdeasListToolbar } from '../components/sections/IdeasListToolbar'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { useUsers } from '../context/UsersContext'
import { ROUTES } from '../constants/app'
import { IDEA_TERM } from '../constants/terminology'
import { isMaster } from '../lib/permissions'
import { loadIdeasViewPrefs, saveIdeasViewPrefs } from '../lib/ideasViewPrefs'
import { filterIdeas, sortIdeas } from '../lib/ideaUtils'
import type { IdeaCategory, IdeaFilters, IdeaPriority, IdeaSource, IdeasViewPrefs } from '../types/idea'
import { IDEA_SOURCES } from '../types/idea'
import { Button } from '../components/ui/Button'

export function IdeasListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { visibleIdeas } = useIdeas()
  const { users } = useUsers()
  const [exportOpen, setExportOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<IdeaCategory[]>([
    'development',
    'monitoring',
  ])
  const [sources, setSources] = useState<IdeaSource[]>([...IDEA_SOURCES])
  const [priority, setPriority] = useState<IdeaPriority | null>(null)
  const [onlyMine, setOnlyMine] = useState(false)
  const [viewPrefs, setViewPrefs] = useState<IdeasViewPrefs>(loadIdeasViewPrefs)

  const baseFilters = useMemo(
    (): Omit<IdeaFilters, 'workflow'> => ({
      search,
      categories,
      sources,
      priority,
      onlyMine,
      currentUserId: user?.id,
      pipeline: 'active',
    }),
    [search, categories, sources, priority, onlyMine, user?.id],
  )

  const activeIdeas = useMemo(
    () =>
      sortIdeas(
        filterIdeas(visibleIdeas, { ...baseFilters, workflow: 'active' }),
        viewPrefs.sort,
      ),
    [visibleIdeas, baseFilters, viewPrefs.sort],
  )

  const completedIdeas = useMemo(
    () =>
      sortIdeas(
        filterIdeas(visibleIdeas, { ...baseFilters, workflow: 'completed' }),
        viewPrefs.sort,
      ),
    [visibleIdeas, baseFilters, viewPrefs.sort],
  )

  const updateViewPrefs = useCallback((patch: Partial<IdeasViewPrefs>) => {
    setViewPrefs((prev) => {
      const next = { ...prev, ...patch }
      saveIdeasViewPrefs(next)
      return next
    })
  }, [])

  const toggleCategory = (cat: IdeaCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const toggleSource = (source: IdeaSource) => {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
    )
  }

  const assigneeNames = useMemo(
    () => new Map(users.map((u) => [u.id, u.name])),
    [users],
  )

  const masterUser = isMaster(user)

  return (
    <AppShell
      variant="ideas"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-display text-headline-lg text-on-surface">
            {IDEA_TERM.listTitle}
          </h2>
          <p className="font-body-md text-secondary">{IDEA_TERM.listSubtitle}</p>
        </div>
        <Button
          icon={<Plus className="h-5 w-5" />}
          onClick={() => navigate(ROUTES.addIdea)}
        >
          {IDEA_TERM.addNew}
        </Button>
      </div>

      <div className="mb-6 md:hidden">
        <div className="relative w-full">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש..."
            className="h-12 w-full rounded-xl border border-border-light bg-surface-container-lowest pr-12 pl-4 font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <IdeasFiltersPanel
            categories={categories}
            onToggleCategory={toggleCategory}
            sources={sources}
            onToggleSource={toggleSource}
            onlyMine={onlyMine}
            onOnlyMineChange={setOnlyMine}
            priority={priority}
            onPriorityChange={setPriority}
            userName={user?.name}
          />
        </aside>

        <div className="flex-1">
          <IdeasListToolbar
            sort={viewPrefs.sort}
            onSortChange={(sort) => updateViewPrefs({ sort })}
            compact={viewPrefs.compact}
            onCompactChange={(compact) => updateViewPrefs({ compact })}
            activeCount={activeIdeas.length}
            completedCount={completedIdeas.length}
            showExport={masterUser}
            onExportClick={() => setExportOpen(true)}
          />

          <div
            className={
              viewPrefs.compact
                ? 'space-y-2'
                : 'space-y-4'
            }
          >
            {activeIdeas.length === 0 ? (
              <p className="rounded-xl border border-border-light bg-surface-container-lowest p-8 text-center font-body-md text-secondary">
                {IDEA_TERM.noActiveMatch}
              </p>
            ) : (
              activeIdeas.map((idea, i) => (
                <div
                  key={idea.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
                >
                  <IdeaListCard idea={idea} compact={viewPrefs.compact} />
                </div>
              ))
            )}
          </div>

          <CompletedIdeasSection ideas={completedIdeas} compact={viewPrefs.compact} />
        </div>
      </div>

      {masterUser && (
        <IdeasExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          ideas={visibleIdeas}
          assigneeNames={assigneeNames}
          initialSearch={search}
          initialCategories={categories}
          initialSources={sources}
          initialPriority={priority}
          initialOnlyMine={onlyMine}
          currentUserId={user?.id}
          initialSort={viewPrefs.sort}
        />
      )}
    </AppShell>
  )
}
