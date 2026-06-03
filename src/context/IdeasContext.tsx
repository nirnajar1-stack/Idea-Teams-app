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
  isActiveIdea,
  normalizeIdea,
} from '../lib/ideaUtils'
import {
  canDeleteIdea,
  canEditIdea,
  canViewIdea,
  filterVisibleIdeas,
} from '../lib/permissions'
import { authorFieldsFromUser } from '../lib/userUtils'
import type { Idea, IdeaFilters, IdeaFormInput, IdeasStats } from '../types/idea'
import { useAuth } from './AuthContext'
import { useUsers } from './UsersContext'

interface IdeasContextValue {
  ideas: Idea[]
  visibleIdeas: Idea[]
  stats: IdeasStats
  addIdea: (input: IdeaFormInput) => Idea
  updateIdea: (id: string, patch: Partial<Idea>) => void
  deleteIdea: (id: string) => boolean
  markCompleted: (id: string) => void
  getIdeaById: (id: string) => Idea | undefined
  getFilteredIdeas: (filters: IdeaFilters) => Idea[]
  getRecentIdeas: (limit?: number) => Idea[]
  getIdeasByUser: (userId: string) => Idea[]
  canDelete: (idea: Idea) => boolean
  canEdit: (idea: Idea) => boolean
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
  const { usersById } = useUsers()
  const [ideas, setIdeas] = useState<Idea[]>(loadIdeas)

  const visibleIdeas = useMemo(
    () => filterVisibleIdeas(ideas, user, usersById),
    [ideas, user, usersById],
  )

  const stats = useMemo(() => computeStats(visibleIdeas), [visibleIdeas])

  const persist = useCallback((next: Idea[]) => {
    setIdeas(next)
    persistIdeas(next)
  }, [])

  const canDelete = useCallback(
    (idea: Idea) => canDeleteIdea(user, idea),
    [user],
  )

  const canEdit = useCallback(
    (idea: Idea) => canEditIdea(user, idea),
    [user],
  )

  const getIdeaById = useCallback(
    (id: string) => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !user || !canViewIdea(user, idea, usersById)) return undefined
      return idea
    },
    [ideas, user, usersById],
  )

  const getFilteredIdeas = useCallback(
    (filters: IdeaFilters) => filterIdeas(visibleIdeas, filters),
    [visibleIdeas],
  )

  const getIdeasByUser = useCallback(
    (userId: string) =>
      visibleIdeas.filter((i) => i.createdByUserId === userId),
    [visibleIdeas],
  )

  const getRecentIdeas = useCallback(
    (limit = 3) =>
      [...visibleIdeas]
        .filter(isActiveIdea)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),
    [visibleIdeas],
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
        workflowStatus: input.sendToMaybeInbox ? 'pending' : 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        targetStartDate: input.targetStartDate,
        sendToMaybeInbox: input.sendToMaybeInbox,
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
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canEditIdea(user, idea)) return
      persist(ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    },
    [ideas, persist, user],
  )

  const deleteIdea = useCallback(
    (id: string): boolean => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canDeleteIdea(user, idea)) return false
      persist(ideas.filter((i) => i.id !== id))
      return true
    },
    [ideas, persist, user],
  )

  const markCompleted = useCallback(
    (id: string) => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canEditIdea(user, idea)) return
      updateIdea(id, {
        workflowStatus: 'completed',
        progress: 100,
        progressStep: 'הושלם',
      })
    },
    [ideas, updateIdea, user],
  )

  const value = useMemo(
    () => ({
      ideas,
      visibleIdeas,
      stats,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      getIdeaById,
      getFilteredIdeas,
      getRecentIdeas,
      getIdeasByUser,
      canDelete,
      canEdit,
    }),
    [
      ideas,
      visibleIdeas,
      stats,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      getIdeaById,
      getFilteredIdeas,
      getRecentIdeas,
      getIdeasByUser,
      canDelete,
      canEdit,
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
