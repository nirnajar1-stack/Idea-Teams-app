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
  findUserByPassword: (password: string) => Promise<FindUserByPasswordResult>
  createUser: (input: UserFormInput, actorUserId?: string) => Promise<StoredUser>
  updateUser: (id: string, input: UserUpdateInput, actorUserId?: string) => Promise<StoredUser>
  deleteUser: (id: string, actorUserId?: string) => Promise<void>
  listManageableUsers: () => StoredUser[]
}

const UsersContext = createContext<UsersContextValue | null>(null)

export type FindUserByPasswordResult =
  | { kind: 'user'; user: StoredUser }
  | { kind: 'ambiguous'; names: string }
  | { kind: 'not_found' }

function persistUsersLocal(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function passwordHashConflictNames(
  users: StoredUser[],
  passwordHash: string,
  exceptUserId?: string,
): string | null {
  const names = users
    .filter(
      (u) =>
        u.active &&
        u.accessLevel !== 'guest' &&
        u.passwordHash === passwordHash &&
        u.id !== exceptUserId,
    )
    .map((u) => u.name)
  return names.length > 0 ? names.join(', ') : null
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
    async (password: string): Promise<FindUserByPasswordResult> => {
      const matches: StoredUser[] = []
      for (const u of users) {
        if (!u.active || u.accessLevel === 'guest' || !u.passwordHash) continue
        if (await verifyPassword(password, u.passwordHash)) matches.push(u)
      }
      if (matches.length === 0) return { kind: 'not_found' }
      if (matches.length > 1) {
        return { kind: 'ambiguous', names: matches.map((u) => u.name).join(', ') }
      }
      return { kind: 'user', user: matches[0] }
    },
    [users],
  )

  const listManageableUsers = useCallback(
    () => users.filter((u) => u.accessLevel !== 'guest'),
    [users],
  )

  const createUser = useCallback(
    async (input: UserFormInput, actorUserId?: string): Promise<StoredUser> => {
      if (usingCloud) {
        if (!actorUserId) throw new Error('actor user required')
        const created = await insertUserToDb(input, actorUserId)
        setUsers((prev) => [...prev, created])
        return created
      }
      const passwordHash = await hashPassword(input.password)
      const conflict = passwordHashConflictNames(users, passwordHash)
      if (conflict) {
        throw new Error(`password_already_used_by: ${conflict}`)
      }
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
    [usingCloud, users],
  )

  const updateUser = useCallback(
    async (id: string, input: UserUpdateInput, actorUserId?: string): Promise<StoredUser> => {
      const current = usersById.get(id)
      if (!current) throw new Error('User not found')

      if (usingCloud) {
        if (!actorUserId) throw new Error('actor user required')
        const updated = await updateUserInDb(id, input, current, actorUserId)
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
        return updated
      }

      const passwordHash = input.password?.trim()
        ? await hashPassword(input.password)
        : undefined

      if (passwordHash) {
        const conflict = passwordHashConflictNames(users, passwordHash, id)
        if (conflict) {
          throw new Error(`password_already_used_by: ${conflict}`)
        }
      }

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
    [usingCloud, users, usersById],
  )

  const deleteUser = useCallback(
    async (id: string, actorUserId?: string) => {
      if (id === GUEST_USER_ID) return
      if (usingCloud) {
        if (!actorUserId) throw new Error('actor user required')
        await deleteUserFromDb(id, actorUserId)
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
