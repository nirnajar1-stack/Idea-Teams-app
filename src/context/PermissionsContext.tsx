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
  fetchPermissionRules,
  upsertPermissionRule,
  upsertPermissionRules,
} from '../api/permissionsApi'
import { canAccessPage } from '../lib/permissionMatrix'
import { isMaster } from '../lib/permissions'
import {
  PERMISSION_CATALOG,
  rulesMap,
  type PermissionKey,
  type PermissionRule,
} from '../types/permission'
import { useAuth } from './AuthContext'
import { useGroups } from './GroupsContext'

interface PermissionsContextValue {
  rules: PermissionRule[]
  rulesByKey: Map<PermissionKey, PermissionRule>
  isReady: boolean
  canManage: boolean
  refresh: () => Promise<void>
  saveRule: (rule: PermissionRule) => Promise<void>
  saveRules: (rules: PermissionRule[]) => Promise<void>
  /** האם למשתמש הנוכחי יש גישה לדף לפי המטריצה + ברירת מחדל */
  canViewPage: (key: PermissionKey, defaultAllowed: boolean) => boolean
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { myGroupIds } = useGroups()
  const [rules, setRules] = useState<PermissionRule[]>([])
  const [isReady, setIsReady] = useState(false)
  const canManage = isMaster(user)

  const refresh = useCallback(async () => {
    const list = await fetchPermissionRules()
    setRules(list)
    setIsReady(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const rulesByKey = useMemo(() => rulesMap(rules), [rules])

  const saveRule = useCallback(
    async (rule: PermissionRule) => {
      if (!user || !canManage) throw new Error('רק מאסטר יכול לערוך הרשאות')
      const saved = await upsertPermissionRule(rule, user.id)
      setRules((prev) => {
        const rest = prev.filter((r) => r.key !== saved.key)
        return [...rest, saved]
      })
    },
    [user, canManage],
  )

  const saveRules = useCallback(
    async (nextRules: PermissionRule[]) => {
      if (!user || !canManage) throw new Error('רק מאסטר יכול לערוך הרשאות')
      const saved = await upsertPermissionRules(nextRules, user.id)
      setRules((prev) => {
        const map = new Map(prev.map((r) => [r.key, r]))
        for (const r of saved) map.set(r.key, r)
        return [...map.values()]
      })
    },
    [user, canManage],
  )

  const canViewPage = useCallback(
    (key: PermissionKey, defaultAllowed: boolean) =>
      canAccessPage(key, user, myGroupIds, rulesByKey, defaultAllowed),
    [user, myGroupIds, rulesByKey],
  )

  const value = useMemo(
    () => ({
      rules,
      rulesByKey,
      isReady,
      canManage,
      refresh,
      saveRule,
      saveRules,
      canViewPage,
    }),
    [
      rules,
      rulesByKey,
      isReady,
      canManage,
      refresh,
      saveRule,
      saveRules,
      canViewPage,
    ],
  )

  return (
    <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
  )
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }
  return ctx
}

export function usePermissionCatalog() {
  return PERMISSION_CATALOG
}
