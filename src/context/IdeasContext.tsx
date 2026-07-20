import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AppSplashLoader } from '../components/ui/AppSplashLoader'
import { DailyIntroVideo } from '../components/ui/DailyIntroVideo'
import { shouldShowMonthlyIntroVideo } from '../lib/monthlyIntroVideo'
import {
  deleteIdeaFromDb,
  fetchIdeasFromDb,
  insertIdeaToDb,
  updateIdeaInDb,
} from '../api/ideasApi'
import { insertAuditEntry } from '../api/auditApi'
import { notifyIdeaCompletedEmail, type EmailNotifyResult } from '../api/emailApi'
import { restoreSupabaseSession } from '../api/authApi'
import { SEED_IDEAS } from '../data/seedIdeas'
import { SPLASH_SHOWN_KEY, STORAGE_KEY } from '../constants/app'
import { isSupabaseEnabled } from '../lib/supabaseClient'
import {
  friendlyIdeasEmptyCloudMessage,
  friendlyIdeasLoadError,
  friendlySupabaseConfigMessage,
} from '../lib/userFriendlyErrors'
import {
  categoryDepartment,
  computeStats,
  filterIdeas,
  generateExternalId,
  generateIdeaId,
  containerProgress,
  isActiveIdea,
  isContainerIdea,
  isRootIdea,
  normalizeIdea,
  sortIdeas,
  todayDateKey,
} from '../lib/ideaUtils'
import {
  canDeleteIdea,
  canEditIdea,
  canManageMasterWorkflow,
  canScheduleOnTimeline,
  canViewIdea,
  filterVisibleIdeas,
} from '../lib/permissions'
import type { IdeaCheckCadence } from '../types/idea'
import { authorFieldsFromUser } from '../lib/userUtils'
import { resolveVisibilityOnCreate } from '../lib/ideaVisibility'
import type { Idea, IdeaFilters, IdeaFormInput, IdeasStats, IdeaSortOption } from '../types/idea'
import { useAuth } from './AuthContext'
import { useEmbedMode } from './EmbedModeContext'
import { useGroups } from './GroupsContext'
import { useUsers } from './UsersContext'

export interface UpdateIdeaResult {
  ok: boolean
  emailNotify?: EmailNotifyResult
}

interface IdeasContextValue {
  ideas: Idea[]
  visibleIdeas: Idea[]
  stats: IdeasStats
  isReady: boolean
  usingCloud: boolean
  cloudConfigured: boolean
  loadError: string | null
  addIdea: (input: IdeaFormInput) => Promise<Idea>
  updateIdea: (id: string, patch: Partial<Idea>) => Promise<UpdateIdeaResult>
  deleteIdea: (id: string) => Promise<boolean>
  markCompleted: (id: string) => Promise<UpdateIdeaResult>
  scheduleIdeaOnTimeline: (id: string, plannedDate: string | null) => Promise<boolean>
  toggleSentToExecution: (id: string, send: boolean) => Promise<boolean>
  setCheckCadence: (id: string, cadence: IdeaCheckCadence | null) => Promise<boolean>
  markRoutineCheckDone: (id: string) => Promise<boolean>
  getIdeaById: (id: string) => Idea | undefined
  getFilteredIdeas: (filters: IdeaFilters) => Idea[]
  getRecentIdeas: (limit?: number, sort?: IdeaSortOption) => Idea[]
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

/** קורא localStorage בלבד — בלי להחזיר seed אם ריק */
function readLocalStorageIdeas(): Idea[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const parsed = JSON.parse(raw) as Idea[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed.map(normalizeIdea)
  } catch {
    return null
  }
}

/** מצב מקומי בלבד (ללא Supabase) — בפרודקשן ללא דמו */
function loadOfflineIdeas(): Idea[] {
  const local = readLocalStorageIdeas()
  if (local) return local
  if (import.meta.env.DEV) return SEED_IDEAS.map(normalizeIdea)
  return []
}

function saveIdeasLocal(ideas: Idea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
}

async function syncIdeasToCloud(ideas: Idea[], appUserId: string): Promise<void> {
  await Promise.all(ideas.map((idea) => updateIdeaInDb(idea.id, idea, appUserId)))
}

export function IdeasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { isEmbed } = useEmbedMode()
  const { usersById, isReady: usersReady } = useUsers()
  const { myGroupIds } = useGroups()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isReady, setIsReady] = useState(false)
  const skipSplash = useMemo(
    () => isEmbed || sessionStorage.getItem(SPLASH_SHOWN_KEY) === '1',
    [isEmbed],
  )
  const [splashExiting, setSplashExiting] = useState(false)
  const [showSplash, setShowSplash] = useState(!skipSplash)
  const [showDailyVideo, setShowDailyVideo] = useState(
    () => !isEmbed && !!(user && shouldShowMonthlyIntroVideo(user)),
  )
  const [usingCloud, setUsingCloud] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const cloudConfigured = isSupabaseEnabled()
  const splashStartedAt = useMemo(() => Date.now(), [])

  useEffect(() => {
    if (!usersReady) return
    let cancelled = false

    ;(async () => {
      if (cloudConfigured) {
        try {
          if (isSupabaseEnabled()) {
            await restoreSupabaseSession()
          }
          const fromDb = await fetchIdeasFromDb(user?.id)

          if (!cancelled) {
            if (fromDb.length > 0) {
              localStorage.removeItem(STORAGE_KEY)
              setIdeas(fromDb.map(normalizeIdea))
              setLoadError(null)
            } else {
              const local = readLocalStorageIdeas()
              setIdeas(local ?? [])
              setLoadError(
                !local?.length ? friendlyIdeasEmptyCloudMessage() : null,
              )
            }
            setUsingCloud(true)
            setIsReady(true)
          }
          return
        } catch (err) {
          console.error('Supabase ideas load failed', err)
          if (!cancelled) {
            const local = readLocalStorageIdeas()
            setIdeas(local ?? [])
            setUsingCloud(true)
            setLoadError(friendlyIdeasLoadError(err, !!local?.length))
            setIsReady(true)
          }
          return
        }
      }

      if (!cancelled) {
        setIdeas(loadOfflineIdeas())
        setUsingCloud(false)
        setLoadError(
          import.meta.env.PROD ? friendlySupabaseConfigMessage() : null,
        )
        setIsReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [usersReady, cloudConfigured, user?.id])

  useEffect(() => {
    if (!user || isEmbed) {
      setShowDailyVideo(false)
      return
    }
    setShowDailyVideo(shouldShowMonthlyIntroVideo(user))
  }, [user, isEmbed])

  useEffect(() => {
    if (!isReady) return
    if (showDailyVideo) return
    if (skipSplash) {
      setShowSplash(false)
      return
    }
    const elapsed = Date.now() - splashStartedAt
    const minDisplay = 1200
    const delay = Math.max(0, minDisplay - elapsed)

    const startExit = window.setTimeout(() => setSplashExiting(true), delay)
    const hide = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, '1')
      setShowSplash(false)
    }, delay + 550)

    return () => {
      window.clearTimeout(startExit)
      window.clearTimeout(hide)
    }
  }, [isReady, splashStartedAt, skipSplash, showDailyVideo])

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
    () => filterVisibleIdeas(ideas, user, usersById, myGroupIds),
    [ideas, user, usersById, myGroupIds],
  )

  const stats = useMemo(() => computeStats(visibleIdeas), [visibleIdeas])

  const canDelete = useCallback((idea: Idea) => canDeleteIdea(user, idea), [user])
  const canEdit = useCallback(
    (idea: Idea) => canEditIdea(user, idea, myGroupIds),
    [user, myGroupIds],
  )

  const getIdeaById = useCallback(
    (id: string) => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !user || !canViewIdea(user, idea, usersById, myGroupIds)) return undefined
      return idea
    },
    [ideas, user, usersById, myGroupIds],
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
    (limit = 3, sort: IdeaSortOption = 'date_desc') =>
      sortIdeas(
        visibleIdeas.filter((i) => isRootIdea(i) && isActiveIdea(i)),
        sort,
      ).slice(0, limit),
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
        department: categoryDepartment(input.category),
        ideaSource: input.ideaSource,
        priority: input.priority,
        workflowStatus: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        targetStartDate: input.targetStartDate,
        sendToMaybeInbox: isContainer ? false : input.sendToMaybeInbox,
        ideaKind,
        parentId: input.parentId,
        ...author,
        tags: input.labelIds?.length
          ? input.labelIds
          : isContainer
            ? ['תת-בקשות/רעיונות']
            : [],
        goals: [],
        attachments: [],
        progress: 0,
        progressStep: isContainer ? 'ממתין לתת-בקשות/רעיונות' : 'שלב 1 מתוך 5',
        visibility: resolveVisibilityOnCreate(user, input.visibility),
      }

      if (usingCloud) await insertIdeaToDb(newIdea, user.id)

      void insertAuditEntry({
        entityType: 'idea',
        entityId: newIdea.id,
        action: 'created',
        actorUserId: user.id,
        actorName: user.name,
        details: { title: newIdea.title },
      })

      const next = applyLocalIdeas((prev) => {
        let list = [newIdea, ...prev]
        if (input.parentId) list = syncContainerProgress(list, input.parentId)
        return list
      })

      if (usingCloud && input.parentId) {
        const parent = next.find((i) => i.id === input.parentId)
        if (parent && isContainerIdea(parent)) {
          await updateIdeaInDb(
            parent.id,
            {
              progress: parent.progress,
              progressStep: parent.progressStep,
            },
            user.id,
          )
        }
      }

      return newIdea
    },
    [applyLocalIdeas, user, usingCloud],
  )

  const updateIdea = useCallback(
    async (id: string, patch: Partial<Idea>): Promise<UpdateIdeaResult> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canEditIdea(user, idea, myGroupIds)) return { ok: false }

      if (usingCloud && user) await updateIdeaInDb(id, patch, user.id)

      const becameCompleted =
        patch.workflowStatus === 'completed' && idea.workflowStatus !== 'completed'
      let emailNotify: EmailNotifyResult | undefined
      if (becameCompleted && usingCloud && user) {
        try {
          emailNotify = await notifyIdeaCompletedEmail(id, user.id)
        } catch (err) {
          console.warn('Email notify failed', err)
          emailNotify = { ok: false, error: String(err) }
        }
      }

      if (user) {
        const action =
          patch.assigneeUserId !== undefined ||
          patch.assigneeUserIds !== undefined ||
          patch.assigneeGroupIds !== undefined
            ? 'assignee_changed'
            : patch.workflowStatus !== undefined
              ? 'status_changed'
              : 'updated'
        void insertAuditEntry({
          entityType: 'idea',
          entityId: id,
          action,
          actorUserId: user.id,
          actorName: user.name,
          details: patch as Record<string, unknown>,
        })
      }

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

      if (usingCloud && user && toSync.length > 0) {
        await syncIdeasToCloud(toSync, user.id)
      }

      return { ok: true, emailNotify }
    },
    [applyLocalIdeas, ideas, user, usingCloud, myGroupIds],
  )

  const deleteIdea = useCallback(
    async (id: string): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canDeleteIdea(user, idea)) return false

      if (usingCloud && user) await deleteIdeaFromDb(id, user.id)

      if (user) {
        void insertAuditEntry({
          entityType: 'idea',
          entityId: id,
          action: 'deleted',
          actorUserId: user.id,
          actorName: user.name,
          details: { title: idea.title },
        })
      }

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
    (id: string) =>
      updateIdea(id, {
        workflowStatus: 'completed',
        progress: 100,
        progressStep: 'הושלם',
      }),
    [updateIdea],
  )

  const scheduleIdeaOnTimeline = useCallback(
    async (id: string, plannedDate: string | null): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canScheduleOnTimeline(user, idea)) return false

      const patch: Partial<Idea> = { plannedDate }

      if (usingCloud && user) await updateIdeaInDb(id, patch, user.id)

      applyLocalIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i
          if (!plannedDate) {
            const { plannedDate: _removed, ...rest } = i
            return rest
          }
          return { ...i, plannedDate }
        }),
      )

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const toggleSentToExecution = useCallback(
    async (id: string, send: boolean): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canManageMasterWorkflow(user, idea)) return false

      const patch: Partial<Idea> = send
        ? {
            sentToExecution: true,
            sentToExecutionAt: new Date().toISOString(),
          }
        : { sentToExecution: false, sentToExecutionAt: null }

      if (usingCloud && user) await updateIdeaInDb(id, patch, user.id)

      applyLocalIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      )

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const setCheckCadence = useCallback(
    async (id: string, cadence: IdeaCheckCadence | null): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canManageMasterWorkflow(user, idea)) return false

      const patch: Partial<Idea> = cadence
        ? { checkCadence: cadence, plannedDate: null }
        : { checkCadence: null }

      if (usingCloud && user) await updateIdeaInDb(id, patch, user.id)

      applyLocalIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i
          if (!cadence) {
            const { checkCadence: _c, lastCheckedAt: _l, ...rest } = i
            return rest
          }
          const { plannedDate: _p, ...rest } = i
          return { ...rest, checkCadence: cadence }
        }),
      )

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const markRoutineCheckDone = useCallback(
    async (id: string): Promise<boolean> => {
      const idea = ideas.find((i) => i.id === id)
      if (!idea || !canManageMasterWorkflow(user, idea) || !idea.checkCadence) return false

      const patch: Partial<Idea> = { lastCheckedAt: todayDateKey() }

      if (usingCloud && user) await updateIdeaInDb(id, patch, user.id)

      applyLocalIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      )

      return true
    },
    [applyLocalIdeas, ideas, user, usingCloud],
  )

  const value = useMemo(
    () => ({
      ideas,
      visibleIdeas,
      stats,
      isReady,
      usingCloud,
      cloudConfigured,
      loadError,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      scheduleIdeaOnTimeline,
      toggleSentToExecution,
      setCheckCadence,
      markRoutineCheckDone,
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
      cloudConfigured,
      loadError,
      addIdea,
      updateIdea,
      deleteIdea,
      markCompleted,
      scheduleIdeaOnTimeline,
      toggleSentToExecution,
      setCheckCadence,
      markRoutineCheckDone,
      getIdeaById,
      getFilteredIdeas,
      getRecentIdeas,
      getIdeasByUser,
      getSubIdeas,
      canDelete,
      canEdit,
    ],
  )

  if (!isReady || showSplash || showDailyVideo) {
    return (
      <>
        {showDailyVideo && user ? (
          <DailyIntroVideo user={user} onComplete={() => setShowDailyVideo(false)} />
        ) : (
          <AppSplashLoader exiting={splashExiting && isReady} />
        )}
        {!isReady && (
          <div className="invisible min-h-screen" aria-hidden>
            טוען…
          </div>
        )}
      </>
    )
  }

  return (
    <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>
  )
}

export function useIdeas(): IdeasContextValue {
  const ctx = useContext(IdeasContext)
  if (!ctx) throw new Error('useIdeas must be used within IdeasProvider')
  return ctx
}
