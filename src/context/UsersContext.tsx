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
  deleteUserFromDb,
  fetchUsersFromDb,
  insertUserToDb,
  updateUserInDb,
  usersApiAvailable,
} from '../api/usersApi'
import { USERS_STORAGE_KEY } from '../constants/app'
import { buildDefaultUsers, GUEST_USER_ID } from '../data/defaultUsers'
import { hashPassword, verifyPassword } from '../lib/password'
import type {
  AppUser,
  StoredUser,
  UserFormInput,
  UserUpdateInput,
} from '../types/user'

interface UsersContextValue {
  users: StoredUser[]
  usersById: Map<string, StoredUser>
  isReady: boolean
  usingCloud: boolean
  getUserById: (id: string) => StoredUser | undefined
  findUserByPassword: (password: string) => Promise<StoredUser | 'ambiguous' | null>
  createUser: (input: UserFormInput) => Promise<StoredUser>
  updateUser: (id: string, input: UserUpdateInput) => Promise<StoredUser>
  deleteUser: (id: string) => void
  listManageableUsers: () => StoredUser[]
}

const UsersContext = createContext<UsersContextValue | null>(null)

function persistUsersLocal(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>([])
  const [isReady, setIsReady] = useState(false)
  const [usingCloud, setUsingCloud] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (usersApiAvailable()) {
        try {
          const fromDb = await fetchUsersFromDb()
          if (!cancelled) {
            setUsers(fromDb)
            setUsingCloud(true)
            setIsReady(true)
          }
          return
        } catch (err) {
          console.error('Supabase users load failed', err)
          if (!cancelled) {
            setLoadError('לא הצלחנו לטעון משתמשים מהענן. בודקים אחסון מקומי…')
          }
        }
      }

      try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as (StoredUser & { role?: string })[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((u) => ({
              ...u,
              jobTitle: u.jobTitle ?? u.role ?? '',
              accessLevel: u.accessLevel ?? 'member',
              passwordHash: u.passwordHash ?? '',
            })) as StoredUser[]
            if (!cancelled) {
              setUsers(normalized)
              setUsingCloud(false)
              setIsReady(true)
            }
            return
          }
        }
      } catch {
        /* ignore */
      }

      const defaults = await buildDefaultUsers()
      if (!cancelled) {
        setUsers(defaults)
        persistUsersLocal(defaults)
        setUsingCloud(false)
        setIsReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const getUserById = useCallback(
    (id: string) => usersById.get(id),
    [usersById],
  )

  const findUserByPassword = useCallback(
    async (password: string): Promise<StoredUser | 'ambiguous' | null> => {
      const matches: StoredUser[] = []
      for (const u of users) {
        if (!u.active || u.accessLevel === 'guest' || !u.passwordHash) continue
        if (await verifyPassword(password, u.passwordHash)) matches.push(u)
      }
      if (matches.length === 0) return null
      if (matches.length > 1) return 'ambiguous'
      return matches[0]
    },
    [users],
  )

  const listManageableUsers = useCallback(
    () => users.filter((u) => u.accessLevel !== 'guest'),
    [users],
  )

  const createUser = useCallback(
    async (input: UserFormInput): Promise<StoredUser> => {
      if (usingCloud) {
        const created = await insertUserToDb(input)
        setUsers((prev) => [...prev, created])
        return created
      }
      const passwordHash = await hashPassword(input.password)
      const newUser: StoredUser = {
        id: `user-${Date.now().toString(36)}`,
        name: input.name.trim(),
        jobTitle: input.jobTitle.trim(),
        email: input.email.trim(),
        username: input.username.trim().toLowerCase(),
        initials:
          input.initials?.trim() ||
          input.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('') ||
          input.name.slice(0, 2),
        passwordHash,
        accessLevel: input.accessLevel,
        active: true,
      }
      setUsers((prev) => {
        const next = [...prev, newUser]
        persistUsersLocal(next)
        return next
      })
      return newUser
    },
    [usingCloud],
  )

  const updateUser = useCallback(
    async (id: string, input: UserUpdateInput): Promise<StoredUser> => {
      const current = usersById.get(id)
      if (!current) throw new Error('User not found')

      if (usingCloud) {
        const updated = await updateUserInDb(id, input, current)
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
        return updated
      }

      const passwordHash = input.password?.trim()
        ? await hashPassword(input.password)
        : undefined

      let updated!: StoredUser
      setUsers((prev) => {
        const next = prev.map((u) => {
          if (u.id !== id) return u
          updated = {
            ...u,
            ...(input.name !== undefined && { name: input.name.trim() }),
            ...(input.jobTitle !== undefined && { jobTitle: input.jobTitle.trim() }),
            ...(input.email !== undefined && { email: input.email.trim() }),
            ...(input.username !== undefined && {
              username: input.username.trim().toLowerCase(),
            }),
            ...(input.initials !== undefined && { initials: input.initials.trim() }),
            ...(input.accessLevel !== undefined && { accessLevel: input.accessLevel }),
            ...(input.active !== undefined && { active: input.active }),
            ...(passwordHash && { passwordHash }),
          }
          return updated
        })
        persistUsersLocal(next)
        return next
      })
      return updated!
    },
    [usingCloud, usersById],
  )

  const deleteUser = useCallback(
    async (id: string) => {
      if (id === GUEST_USER_ID) return
      if (usingCloud) {
        await deleteUserFromDb(id)
      }
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== id)
        if (!usingCloud) persistUsersLocal(next)
        return next
      })
    },
    [usingCloud],
  )

  const value = useMemo(
    () => ({
      users,
      usersById,
      isReady,
      usingCloud,
      getUserById,
      findUserByPassword,
      createUser,
      updateUser,
      deleteUser,
      listManageableUsers,
    }),
    [
      users,
      usersById,
      isReady,
      usingCloud,
      getUserById,
      findUserByPassword,
      createUser,
      updateUser,
      deleteUser,
      listManageableUsers,
    ],
  )

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background font-body-md text-secondary">
        <p>טוען משתמשים…</p>
        {loadError && <p className="text-label-sm text-error">{loadError}</p>}
      </div>
    )
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used within UsersProvider')
  return ctx
}

export function storedToAppUser(
  stored: StoredUser,
  guestSessionId?: string,
): AppUser {
  const { passwordHash: _p, ...rest } = stored
  if (stored.accessLevel === 'guest' && guestSessionId) {
    return { ...rest, guestSessionId }
  }
  return rest
}
