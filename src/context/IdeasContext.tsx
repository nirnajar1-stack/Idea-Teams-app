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
  containerProgress,
  isActiveIdea,
  isContainerIdea,
  isRootIdea,
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
  getSubIdeas: (parentId: string) => Idea[]
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

  const getSubIdeas = useCallback(
    (parentId: string) =>
      visibleIdeas
        .filter((i) => i.parentId === parentId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [visibleIdeas],
  )

  const getRecentIdeas = useCallback(
    (limit = 3) =>
      [...visibleIdeas]
        .filter((i) => isRootIdea(i) && isActiveIdea(i))
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
      const ideaKind = input.parentId
        ? 'standard'
        : input.ideaKind ?? 'standard'
      const isContainer = ideaKind === 'container'

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
        targetStartDate: input.targetStartDate,
        sendToMaybeInbox: isContainer ? false : input.sendToMaybeInbox,
        ideaKind,
        parentId: input.parentId,
        ...author,
        tags: [
          isContainer
            ? 'תת-רעיונות'
            : input.category === 'development'
              ? 'פיתוח'
              : 'בקרה',
        ],
        goals: [],
        attachments: [],
        progress: 0,
        progressStep: isContainer ? 'ממתין לתת-רעיונות' : 'שלב 1 מתוך 5',
      }

      let next = [newIdea, ...ideas]
      if (input.parentId) {
        next = next.map((i) => {
          if (i.id !== input.parentId || !isContainerIdea(i)) return i
          const subs = next.filter((s) => s.parentId === i.id)
          const prog = containerProgress(subs)
          return { ...i, progress: prog.percent, progressStep: prog.stepLabel }
        })
      }
      persist(next)
      return newIdea
    },
    [ideas, persist, user],
  )

  const updateIdea = useCallback(
    (id: string, patch: Partial<Idea>) => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canEditIdea(user, idea)) return
      let next = ideas.map((i) => (i.id === id ? { ...i, ...patch } : i))
      const updated = next.find((i) => i.id === id)
      if (updated?.parentId) {
        next = syncContainerProgress(next, updated.parentId)
      } else if (updated && isContainerIdea(updated)) {
        next = syncContainerProgress(next, id)
      }
      persist(next)
    },
    [ideas, persist, user],
  )

  function syncContainerProgress(all: Idea[], containerId: string): Idea[] {
    const subs = all.filter((i) => i.parentId === containerId)
    const prog = containerProgress(subs)
    return all.map((i) =>
      i.id === containerId
        ? { ...i, progress: prog.percent, progressStep: prog.stepLabel }
        : i,
    )
  }

  const deleteIdea = useCallback(
    (id: string): boolean => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canDeleteIdea(user, idea)) return false
      const toRemove = new Set<string>([id])
      if (isContainerIdea(idea)) {
        ideas.filter((i) => i.parentId === id).forEach((s) => toRemove.add(s.id))
      }
      persist(ideas.filter((i) => !toRemove.has(i.id)))
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
      getSubIdeas,
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
      getSubIdeas,
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
