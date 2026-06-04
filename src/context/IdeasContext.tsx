import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  deleteIdeaFromDb,
  fetchIdeasFromDb,
  ideasApiAvailable,
  insertIdeaToDb,
  updateIdeaInDb,
  upsertIdeasToDb,
} from '../api/ideasApi'
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
  isReady: boolean
  usingCloud: boolean
  addIdea: (input: IdeaFormInput) => Promise<Idea>
  updateIdea: (id: string, patch: Partial<Idea>) => Promise<boolean>
  deleteIdea: (id: string) => Promise<boolean>
  markCompleted: (id: string) => Promise<void>
  getIdeaById: (id: string) => Idea | undefined
  getFilteredIdeas: (filters: IdeaFilters) => Idea[]
  getRecentIdeas: (limit?: number) => Idea[]
  getIdeasByUser: (userId: string) => Idea[]
  getSubIdeas: (parentId: string) => Idea[]
  canDelete: (idea: Idea) => boolean
  canEdit: (idea: Idea) => boolean
}

const IdeasContext = createContext<IdeasContextValue | null>(null)

function syncContainerProgress(all: Idea[], containerId: string): Idea[] {
  const subs = all.filter((i) => i.parentId === containerId)
  const prog = containerProgress(subs)
  return all.map((i) =>
    i.id === containerId
      ? { ...i, progress: prog.percent, progressStep: prog.stepLabel }
      : i,
  )
}

function loadIdeasLocal(): Idea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw != null) {
      const parsed = JSON.parse(raw) as Idea[]
      if (Array.isArray(parsed)) return parsed.map(normalizeIdea)
    }
  } catch {
    /* ignore */
  }
  return SEED_IDEAS.map(normalizeIdea)
}

function saveIdeasLocal(ideas: Idea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
}

async function syncIdeasToCloud(ideas: Idea[]): Promise<void> {
  await Promise.all(ideas.map((idea) => updateIdeaInDb(idea.id, idea)))
}

export function IdeasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { usersById, isReady: usersReady } = useUsers()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isReady, setIsReady] = useState(false)
  const [usingCloud, setUsingCloud] = useState(false)

  useEffect(() => {
    if (!usersReady) return
    let cancelled = false

    ;(async () => {
      if (ideasApiAvailable()) {
        try {
          let fromDb = await fetchIdeasFromDb()
          const local = loadIdeasLocal()
          const hasLocalData =
            local.length > 0 &&
            JSON.stringify(local) !== JSON.stringify(SEED_IDEAS.map(normalizeIdea))

          if (fromDb.length === 0 && hasLocalData) {
            await upsertIdeasToDb(local.map(normalizeIdea))
            fromDb = await fetchIdeasFromDb()
          }

          if (!cancelled) {
            setIdeas(fromDb.map(normalizeIdea))
            setUsingCloud(true)
            setIsReady(true)
          }
          return
        } catch (err) {
          console.error('Supabase ideas load failed', err)
        }
      }

      if (!cancelled) {
        const local = loadIdeasLocal()
        setIdeas(local)
        setUsingCloud(false)
        setIsReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [usersReady])

  const applyLocalIdeas = useCallback(
    (updater: (prev: Idea[]) => Idea[]) => {
      let next!: Idea[]
      setIdeas((prev) => {
        next = updater(prev)
        if (!usingCloud) saveIdeasLocal(next)
        return next
      })
      return next!
    },
    [usingCloud],
  )

  const visibleIdeas = useMemo(
    () => filterVisibleIdeas(ideas, user, usersById),
    [ideas, user, usersById],
  )

  const stats = useMemo(() => computeStats(visibleIdeas), [visibleIdeas])

  const canDelete = useCallback((idea: Idea) => canDeleteIdea(user, idea), [user])
  const canEdit = useCallback((idea: Idea) => canEditIdea(user, idea), [user])

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
    (userId: string) => visibleIdeas.filter((i) => i.createdByUserId === userId),
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
    async (input: IdeaFormInput): Promise<Idea> => {
      if (!user) throw new Error('Cannot add idea without authenticated user')

      const author = authorFieldsFromUser(user)
      const ideaKind = input.parentId ? 'standard' : input.ideaKind ?? 'standard'
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

      if (usingCloud) await insertIdeaToDb(newIdea)

      const next = applyLocalIdeas((prev) => {
        let list = [newIdea, ...prev]
        if (input.parentId) list = syncContainerProgress(list, input.parentId)
        return list
      })

      if (usingCloud && input.parentId) {
        const parent = next.find((i) => i.id === input.parentId)
        if (parent && isContainerIdea(parent)) {
          await updateIdeaInDb(parent.id, {
            progress: parent.progress,
            progressStep: parent.progressStep,
          })
        }
      }

      return newIdea
    },
    [applyLocalIdeas, user, usingCloud],
  )

  const updateIdea = useCallback(
    async (id: string, patch: Partial<Idea>): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canEditIdea(user, idea)) return false

      if (usingCloud) await updateIdeaInDb(id, patch)

      const toSync: Idea[] = []
      applyLocalIdeas((prev) => {
        let next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
        const changed = next.find((i) => i.id === id)
        if (changed?.parentId) {
          next = syncContainerProgress(next, changed.parentId)
          const parent = next.find((i) => i.id === changed.parentId)
          if (parent) toSync.push(parent)
        } else if (changed && isContainerIdea(changed)) {
          next = syncContainerProgress(next, id)
          const parent = next.find((i) => i.id === id)
          if (parent) toSync.push(parent)
        }
        const self = next.find((i) => i.id === id)
        if (self) toSync.unshift(self)
        return next
      })

      if (usingCloud && toSync.length > 0) await syncIdeasToCloud(toSync)

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const deleteIdea = useCallback(
    async (id: string): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canDeleteIdea(user, idea)) return false

      if (usingCloud) await deleteIdeaFromDb(id)

      applyLocalIdeas((prev) => {
        const toRemove = new Set<string>([id])
        if (isContainerIdea(idea)) {
          prev.filter((i) => i.parentId === id).forEach((s) => toRemove.add(s.id))
        }
        return prev.filter((i) => !toRemove.has(i.id))
      })

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const markCompleted = useCallback(
    async (id: string) => {
      await updateIdea(id, {
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
      visibleIdeas,
      stats,
      isReady,
      usingCloud,
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
      isReady,
      usingCloud,
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

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-body-md text-secondary">
        טוען רעיונות…
      </div>
    )
  }

  return <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>
}

export function useIdeas(): IdeasContextValue {
  const ctx = useContext(IdeasContext)
  if (!ctx) throw new Error('useIdeas must be used within IdeasProvider')
  return ctx
}
