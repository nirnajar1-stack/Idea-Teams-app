import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaListCard } from '../components/sections/IdeaListCard'
import { IdeasFiltersPanel } from '../components/sections/IdeasFiltersPanel'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'
import type { IdeaCategory, IdeaFilters, IdeaPriority } from '../types/idea'
import { Button } from '../components/ui/Button'

export function IdeasListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getFilteredIdeas } = useIdeas()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<IdeaCategory[]>([
    'development',
    'monitoring',
  ])
  const [priority, setPriority] = useState<IdeaPriority | null>(null)
  const [onlyMine, setOnlyMine] = useState(false)

  const filters: IdeaFilters = useMemo(
    () => ({
      search,
      categories,
      priority,
      onlyMine,
      currentUserId: user?.id,
      pipeline: 'active',
    }),
    [search, categories, priority, onlyMine, user?.id],
  )

  const ideas = getFilteredIdeas(filters)

  const toggleCategory = (cat: IdeaCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  return (
    <AppShell
      variant="ideas"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-display text-headline-lg text-on-surface">
            רשימת רעיונות
          </h2>
          <p className="font-body-md text-secondary">
            נהלו ותעדפו את הרעיונות המרכזיים של הצוות שלכם.
          </p>
        </div>
        <Button
          icon={<Plus className="h-5 w-5" />}
          onClick={() => navigate(ROUTES.addIdea)}
        >
          הוסף רעיון חדש
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
            onlyMine={onlyMine}
            onOnlyMineChange={setOnlyMine}
            priority={priority}
            onPriorityChange={setPriority}
            userName={user?.name}
          />
        </aside>

        <div className="flex-1 space-y-4">
          {ideas.length === 0 ? (
            <p className="rounded-xl border border-border-light bg-surface-container-lowest p-8 text-center font-body-md text-secondary">
              לא נמצאו רעיונות התואמים את החיפוש
            </p>
          ) : (
            ideas.map((idea) => <IdeaListCard key={idea.id} idea={idea} />)
          )}
        </div>
      </div>
    </AppShell>
  )
}
