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
  createLinkedBoard,
  deleteLinkedBoard,
  fetchLinkedBoards,
  updateLinkedBoard,
} from '../api/linkedBoardsApi'
import { isMaster } from '../lib/permissions'
import type { LinkedBoard, LinkedBoardInput } from '../types/linkedBoard'
import { useAuth } from './AuthContext'

interface LinkedBoardsContextValue {
  boards: LinkedBoard[]
  isReady: boolean
  canManage: boolean
  refresh: () => Promise<void>
  createBoard: (input: LinkedBoardInput) => Promise<LinkedBoard>
  updateBoard: (
    id: string,
    patch: Partial<
      Pick<
        LinkedBoard,
        'title' | 'url' | 'provider' | 'viewMode' | 'description' | 'sortOrder' | 'active'
      >
    >,
  ) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  getBoardById: (id: string) => LinkedBoard | undefined
}

const LinkedBoardsContext = createContext<LinkedBoardsContextValue | null>(null)

export function LinkedBoardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [boards, setBoards] = useState<LinkedBoard[]>([])
  const [isReady, setIsReady] = useState(false)
  const canManage = isMaster(user)

  const refresh = useCallback(async () => {
    const list = await fetchLinkedBoards()
    setBoards(list.filter((b) => b.active))
    setIsReady(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createBoard = useCallback(
    async (input: LinkedBoardInput) => {
      if (!user || !canManage) throw new Error('רק מאסטר יכול להוסיף לוחות')
      const created = await createLinkedBoard(input, user.id)
      setBoards((prev) =>
        [...prev, created].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'he'),
        ),
      )
      return created
    },
    [user, canManage],
  )

  const updateBoardFn = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          LinkedBoard,
          'title' | 'url' | 'provider' | 'viewMode' | 'description' | 'sortOrder' | 'active'
        >
      >,
    ) => {
      if (!canManage) throw new Error('רק מאסטר יכול לערוך לוחות')
      await updateLinkedBoard(id, patch)
      setBoards((prev) =>
        prev
          .map((b) => (b.id === id ? { ...b, ...patch } : b))
          .filter((b) => b.active !== false)
          .sort(
            (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'he'),
          ),
      )
    },
    [canManage],
  )

  const deleteBoardFn = useCallback(
    async (id: string) => {
      if (!canManage) throw new Error('רק מאסטר יכול למחוק לוחות')
      await deleteLinkedBoard(id)
      setBoards((prev) => prev.filter((b) => b.id !== id))
    },
    [canManage],
  )

  const getBoardById = useCallback(
    (id: string) => boards.find((b) => b.id === id),
    [boards],
  )

  const value = useMemo(
    () => ({
      boards,
      isReady,
      canManage,
      refresh,
      createBoard,
      updateBoard: updateBoardFn,
      deleteBoard: deleteBoardFn,
      getBoardById,
    }),
    [
      boards,
      isReady,
      canManage,
      refresh,
      createBoard,
      updateBoardFn,
      deleteBoardFn,
      getBoardById,
    ],
  )

  return (
    <LinkedBoardsContext.Provider value={value}>{children}</LinkedBoardsContext.Provider>
  )
}

export function useLinkedBoards() {
  const ctx = useContext(LinkedBoardsContext)
  if (!ctx) throw new Error('useLinkedBoards must be used within LinkedBoardsProvider')
  return ctx
}
