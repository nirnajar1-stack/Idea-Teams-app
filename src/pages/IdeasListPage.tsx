import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { CompletedIdeasSection } from '../components/sections/CompletedIdeasSection'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { IdeasCompactTable } from '../components/sections/IdeasCompactTable'
import { IdeasExportModal } from '../components/sections/IdeasExportModal'
import { IdeasFiltersPanel } from '../components/sections/IdeasFiltersPanel'
import { IdeasListToolbar } from '../components/sections/IdeasListToolbar'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { useIdeas } from '../context/IdeasContext'
import { usePermissions } from '../context/PermissionsContext'
import { useQuickAdd } from '../context/QuickAddContext'
import { useUsers } from '../context/UsersContext'
import { IDEA_TERM } from '../constants/terminology'
import {
  canExportIdeasWithRules,
  canManageExecutionAction,
} from '../lib/permissionMatrix'
import {
  DEFAULT_IDEAS_FILTERS,
  isDefaultFilters,
  loadIdeasFiltersPrefs,
  saveIdeasFiltersPrefs,
  type IdeasFiltersPrefs,
} from '../lib/ideasFiltersPrefs'
import { loadIdeasViewPrefs, saveIdeasViewPrefs } from '../lib/ideasViewPrefs'
import { filterIdeas, isActivelyOverdue, sortIdeas } from '../lib/ideaUtils'
import { cn } from '../lib/cn'
import type { IdeaCategory, IdeaFilters, IdeaSource, IdeasViewPrefs } from '../types/idea'
import { IDEA_SOURCES } from '../types/idea'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'

type QuickView = 'all' | 'mine' | 'overdue' | 'unlabeled'

const QUICK_VIEWS: { id: QuickView; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'mine', label: 'שלי' },
  { id: 'overdue', label: 'באיחור' },
  { id: 'unlabeled', label: 'ללא לייבל' },
]

function hasLabelTag(tags: string[] | undefined): boolean {
  return (tags ?? []).some((t) => t.startsWith('lbl-'))
}

export function IdeasListPage() {
  const { user } = useAuth()
  const { openQuickAdd } = useQuickAdd()
  const { visibleIdeas, toggleSentToExecution } = useIdeas()
  const { users } = useUsers()
  const { myGroupIds } = useGroups()
  const { rulesByKey } = usePermissions()
  const [exportOpen, setExportOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<IdeasFiltersPrefs>(loadIdeasFiltersPrefs)
  const [viewPrefs, setViewPrefs] = useState<IdeasViewPrefs>(loadIdeasViewPrefs)
  const [quickView, setQuickView] = useState<QuickView>('all')

  const { categories, sources, priority, onlyMine, onlyExecution } = filters

  useEffect(() => {
    saveIdeasFiltersPrefs(filters)
  }, [filters])

  const patchFilters = useCallback((patch: Partial<IdeasFiltersPrefs>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_IDEAS_FILTERS,
      categories: ['development', 'monitoring', 'technical'],
      sources: [...IDEA_SOURCES],
    })
    setSearch('')
    setQuickView('all')
  }, [])

  const filtersActive =
    !isDefaultFilters(filters) || search.trim().length > 0 || quickView !== 'all'

  const baseFilters = useMemo(
    (): Omit<IdeaFilters, 'workflow'> => ({
      search,
      categories,
      sources,
      priority,
      onlyMine: onlyMine || quickView === 'mine',
      onlySentToExecution: onlyExecution || undefined,
      currentUserId: user?.id,
      pipeline: 'active',
    }),
    [search, categories, sources, priority, onlyMine, onlyExecution, user?.id, quickView],
  )

  const activeIdeas = useMemo(() => {
    let list = sortIdeas(
      filterIdeas(visibleIdeas, { ...baseFilters, workflow: 'active' }),
      viewPrefs.sort,
    )
    if (quickView === 'overdue') list = list.filter(isActivelyOverdue)
    if (quickView === 'unlabeled') list = list.filter((i) => !hasLabelTag(i.tags))
    return list
  }, [visibleIdeas, baseFilters, viewPrefs.sort, quickView])

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
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  const toggleSource = (source: IdeaSource) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }))
  }

  const assigneeNames = useMemo(
    () => new Map(users.map((u) => [u.id, u.name])),
    [users],
  )

  const canExport = canExportIdeasWithRules(user, myGroupIds, rulesByKey)
  const canManageExecution = canManageExecutionAction(user, myGroupIds, rulesByKey)

  const handleExecutionToggle = useCallback(
    async (ideaId: string, send: boolean) => {
      const ok = await toggleSentToExecution(ideaId, send)
      if (!ok) toast.error('לא ניתן לעדכן תיוג לביצוע')
      else toast.success(send ? 'סומן לביצוע' : 'הוסר תיוג לביצוע')
    },
    [toggleSentToExecution],
  )

  return (
    <AppShell
      variant="ideas"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mb-5 flex flex-col justify-between gap-3 md:mb-6 md:flex-row md:items-end md:gap-6">
        <div>
          <h2 className="font-display text-headline-lg text-on-surface">
            {IDEA_TERM.listTitle}
          </h2>
          <p className="mt-1 text-body-sm text-secondary">{IDEA_TERM.listSubtitle}</p>
        </div>
        <Button icon={<Plus className="h-5 w-5" />} onClick={openQuickAdd}>
          {IDEA_TERM.addNew}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="תצוגות מהירות">
        {QUICK_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setQuickView(view.id)}
            className={cn(
              'min-h-9 rounded-full px-3.5 text-label-sm transition-colors',
              quickView === view.id
                ? 'bg-primary text-on-primary shadow-soft'
                : 'bg-surface-container text-secondary hover:text-on-surface',
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="mb-5 md:hidden">
        <div className="relative w-full">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש..."
            className="boutique-input h-12 w-full pr-12 pl-4"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:w-64">
          <IdeasFiltersPanel
            categories={categories}
            onToggleCategory={toggleCategory}
            sources={sources}
            onToggleSource={toggleSource}
            onlyMine={onlyMine}
            onOnlyMineChange={(value) => patchFilters({ onlyMine: value })}
            priority={priority}
            onPriorityChange={(value) => patchFilters({ priority: value })}
            userName={user?.name}
            showExecutionFilter={canManageExecution}
            onlyExecution={onlyExecution}
            onOnlyExecutionChange={(value) => patchFilters({ onlyExecution: value })}
            showClearAll={filtersActive}
            onClearAll={clearFilters}
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
            showExport={canExport}
            onExportClick={() => setExportOpen(true)}
          />

          {activeIdeas.length === 0 ? (
            <div className="rounded-[1.75rem] border border-transparent bg-surface-container-lowest p-8 shadow-card">
              <EmptyState
                title={IDEA_TERM.noActiveMatch}
                description={
                  filtersActive
                    ? 'נסו לנקות פילטרים או לשנות את החיפוש.'
                    : undefined
                }
                action={
                  filtersActive ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn-boutique min-h-12 px-4"
                    >
                      נקה פילטרים
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : viewPrefs.compact ? (
            <IdeasCompactTable
              ideas={activeIdeas}
              showMasterExecutionToggle={canManageExecution}
              onExecutionToggle={handleExecutionToggle}
            />
          ) : (
            <div className="list-stagger space-y-4">
              {activeIdeas.map((idea) => (
                <div key={idea.id}>
                  <IdeaListCard
                    idea={idea}
                    showMasterExecutionToggle={canManageExecution}
                    onExecutionToggle={handleExecutionToggle}
                  />
                </div>
              ))}
            </div>
          )}

          <CompletedIdeasSection ideas={completedIdeas} compact={viewPrefs.compact} />
        </div>
      </div>

      {canExport && (
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
