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
  createTaskLabel,
  deleteTaskLabel,
  fetchTaskLabels,
  updateTaskLabel,
} from '../api/labelsApi'
import { canManageLabels } from '../lib/permissions'
import type { TaskLabel, TaskLabelInput } from '../types/label'
import { useAuth } from './AuthContext'

interface LabelsContextValue {
  labels: TaskLabel[]
  isReady: boolean
  canManage: boolean
  refresh: () => Promise<void>
  createLabel: (input: TaskLabelInput) => Promise<TaskLabel>
  updateLabel: (
    id: string,
    patch: Partial<Pick<TaskLabel, 'name' | 'color' | 'active'>>,
  ) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  getLabelById: (id: string) => TaskLabel | undefined
}

const LabelsContext = createContext<LabelsContextValue | null>(null)

export function LabelsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [labels, setLabels] = useState<TaskLabel[]>([])
  const [isReady, setIsReady] = useState(false)
  const canManage = canManageLabels(user)

  const refresh = useCallback(async () => {
    const list = await fetchTaskLabels()
    setLabels(list.filter((l) => l.active))
    setIsReady(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createLabel = useCallback(
    async (input: TaskLabelInput) => {
      if (!user || !canManage) throw new Error('אין הרשאה ליצור לייבלים')
      const created = await createTaskLabel(input, user.id)
      setLabels((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'he')))
      return created
    },
    [user, canManage],
  )

  const updateLabelFn = useCallback(
    async (id: string, patch: Partial<Pick<TaskLabel, 'name' | 'color' | 'active'>>) => {
      if (!canManage) throw new Error('אין הרשאה לערוך לייבלים')
      await updateTaskLabel(id, patch)
      setLabels((prev) =>
        prev
          .map((l) => (l.id === id ? { ...l, ...patch } : l))
          .filter((l) => l.active)
          .sort((a, b) => a.name.localeCompare(b.name, 'he')),
      )
    },
    [canManage],
  )

  const deleteLabelFn = useCallback(
    async (id: string) => {
      if (!canManage) throw new Error('אין הרשאה למחוק לייבלים')
      await deleteTaskLabel(id)
      setLabels((prev) => prev.filter((l) => l.id !== id))
    },
    [canManage],
  )

  const getLabelById = useCallback((id: string) => labels.find((l) => l.id === id), [labels])

  const value = useMemo(
    () => ({
      labels,
      isReady,
      canManage,
      refresh,
      createLabel,
      updateLabel: updateLabelFn,
      deleteLabel: deleteLabelFn,
      getLabelById,
    }),
    [
      labels,
      isReady,
      canManage,
      refresh,
      createLabel,
      updateLabelFn,
      deleteLabelFn,
      getLabelById,
    ],
  )

  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
}

export function useLabels() {
  const ctx = useContext(LabelsContext)
  if (!ctx) throw new Error('useLabels must be used within LabelsProvider')
  return ctx
}
