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
  createGroup,
  deleteGroup,
  fetchGroups,
  updateGroup,
} from '../api/groupsApi'
import { canManageUsers } from '../lib/permissions'
import type { AppGroup, AppGroupInput } from '../types/group'
import { useAuth } from './AuthContext'

interface GroupsContextValue {
  groups: AppGroup[]
  isReady: boolean
  canManage: boolean
  refresh: () => Promise<void>
  create: (input: AppGroupInput) => Promise<AppGroup>
  update: (
    id: string,
    patch: Partial<Pick<AppGroup, 'name' | 'active' | 'memberIds'>>,
  ) => Promise<void>
  remove: (id: string) => Promise<void>
  getGroupById: (id: string) => AppGroup | undefined
  /** group ids the current user belongs to */
  myGroupIds: string[]
}

const GroupsContext = createContext<GroupsContextValue | null>(null)

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<AppGroup[]>([])
  const [isReady, setIsReady] = useState(false)
  const canManage = canManageUsers(user)

  const refresh = useCallback(async () => {
    const list = await fetchGroups()
    setGroups(list.filter((g) => g.active))
    setIsReady(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: AppGroupInput) => {
      if (!user || !canManage) throw new Error('אין הרשאה לנהל קבוצות')
      const created = await createGroup(input, user.id)
      setGroups((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'he')),
      )
      return created
    },
    [user, canManage],
  )

  const updateFn = useCallback(
    async (
      id: string,
      patch: Partial<Pick<AppGroup, 'name' | 'active' | 'memberIds'>>,
    ) => {
      if (!canManage) throw new Error('אין הרשאה לנהל קבוצות')
      await updateGroup(id, patch)
      setGroups((prev) =>
        prev
          .map((g) => (g.id === id ? { ...g, ...patch } : g))
          .filter((g) => g.active)
          .sort((a, b) => a.name.localeCompare(b.name, 'he')),
      )
    },
    [canManage],
  )

  const removeFn = useCallback(
    async (id: string) => {
      if (!canManage) throw new Error('אין הרשאה למחוק קבוצות')
      await deleteGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
    },
    [canManage],
  )

  const myGroupIds = useMemo(() => {
    if (!user) return []
    return groups.filter((g) => g.memberIds.includes(user.id)).map((g) => g.id)
  }, [groups, user])

  const value = useMemo(
    () => ({
      groups,
      isReady,
      canManage,
      refresh,
      create,
      update: updateFn,
      remove: removeFn,
      getGroupById: (id: string) => groups.find((g) => g.id === id),
      myGroupIds,
    }),
    [groups, isReady, canManage, refresh, create, updateFn, removeFn, myGroupIds],
  )

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>
}

export function useGroups(): GroupsContextValue {
  const ctx = useContext(GroupsContext)
  if (!ctx) throw new Error('useGroups must be used within GroupsProvider')
  return ctx
}
