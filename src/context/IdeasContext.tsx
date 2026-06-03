import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SEED_IDEAS } from '../data/seedIdeas'
import { STORAGE_KEY } from '../constants/app'
import {
  computeStats,
  filterIdeas,
  generateExternalId,
  generateIdeaId,
  normalizeIdea,
} from '../lib/ideaUtils'
import { authorFieldsFromUser } from '../lib/userUtils'
import type { Idea, IdeaFilters, IdeaFormInput, IdeasStats } from '../types/idea'
import type { UserId } from '../types/user'
import { useAuth } from './AuthContext'

interface IdeasContextValue {
  ideas: Idea[]
  stats: IdeasStats
  addIdea: (input: IdeaFormInput) => Idea
  updateIdea: (id: string, patch: Partial<Idea>) => void
  deleteIdea: (id: string) => void
  markCompleted: (id: string) => void
  getIdeaById: (id: string) => Idea | undefined
  getFilteredIdeas: (filters: IdeaFilters) => Idea[]
  getRecentIdeas: (limit?: number) => Idea[]
  getIdeasByUser: (userId: UserId) => Idea[]
}

const IdeasContext = createContext<IdeasContextValue | null>(null)

function loadIdeas(): Idea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Idea[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeIdea)
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return SEED_IDEAS
}

function persistIdeas(ideas: Idea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
}

export function IdeasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>(loadIdeas)

  const persist = useCallback((next: Idea[]) => {
    setIdeas(next)
    persistIdeas(next)
  }, [])

  const stats = useMemo(() => computeStats(ideas), [ideas])

  const getIdeaById = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas],
  )

  const getFilteredIdeas = useCallback(
    (filters: IdeaFilters) => filterIdeas(ideas, filters),
    [ideas],
  )

  const getIdeasByUser = useCallback(
    (userId: UserId) => ideas.filter((i) => i.createdByUserId === userId),
    [ideas],
  )

  const getRecentIdeas = useCallback(
    (limit = 3) =>
      [...ideas]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),
    [ideas],
  )

  const addIdea = useCallback(
    (input: IdeaFormInput): Idea => {
      if (!user) {
        throw new Error('Cannot add idea without authenticated user')
      }
      const author = authorFieldsFromUser(user)
      const newIdea: Idea = {
        id: generateIdeaId(),
        externalId: generateExternalId(),
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        department: input.category === 'development' ? 'פיתוח' : 'בקרה',
        priority: input.priority,
        workflowStatus: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        ...author,
        tags: [input.category === 'development' ? 'פיתוח' : 'בקרה'],
        goals: [],
        attachments: [],
        progress: 0,
        progressStep: 'שלב 1 מתוך 5',
      }
      persist([newIdea, ...ideas])
      return newIdea
    },
    [ideas, persist, user],
  )

  const updateIdea = useCallback(
    (id: string, patch: Partial<Idea>) => {
      persist(ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    },
    [ideas, persist],
  )

  const deleteIdea = useCallback(
    (id: string) => {
      persist(ideas.filter((i) => i.id !== id))
    },
    [ideas, persist],
  )

  const markCompleted = useCallback(
    (id: string) => {
      updateIdea(id, {
        workflowStatus: 'completed',
        progress: 100,
        progressStep: 'הושלם',
      })
    },
    [updateIdea],
  )

  const value = useMemo(
    () => ({
      ideas,
      stats,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      getIdeaById,
      getFilteredIdeas,
      getRecentIdeas,
      getIdeasByUser,
    }),
    [
      ideas,
      stats,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      getIdeaById,
      getFilteredIdeas,
      getRecentIdeas,
      getIdeasByUser,
    ],
  )

  return (
    <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>
  )
}

export function useIdeas(): IdeasContextValue {
  const ctx = useContext(IdeasContext)
  if (!ctx) {
    throw new Error('useIdeas must be used within IdeasProvider')
  }
  return ctx
}
