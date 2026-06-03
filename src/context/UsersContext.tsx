import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
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
  getUserById: (id: string) => StoredUser | undefined
  findUserByPassword: (password: string) => Promise<StoredUser | 'ambiguous' | null>
  createUser: (input: UserFormInput) => Promise<StoredUser>
  updateUser: (id: string, input: UserUpdateInput) => Promise<StoredUser>
  deleteUser: (id: string) => void
  listManageableUsers: () => StoredUser[]
}

const UsersContext = createContext<UsersContextValue | null>(null)

function persistUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return parts[0].slice(0, 1) + parts[1].slice(0, 1)
  }
  return name.slice(0, 2)
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
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
            const needsPasswords = normalized.some(
              (u) => u.accessLevel !== 'guest' && !u.passwordHash,
            )
            if (needsPasswords) {
              const defaults = await buildDefaultUsers()
              const byId = new Map(defaults.map((d) => [d.id, d]))
              const merged = normalized.map((u) =>
                !u.passwordHash && byId.has(u.id)
                  ? { ...u, passwordHash: byId.get(u.id)!.passwordHash }
                  : u,
              )
              if (!cancelled) {
                setUsers(merged)
                persistUsers(merged)
                setIsReady(true)
              }
              return
            }
            if (!cancelled) {
              setUsers(normalized)
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
        persistUsers(defaults)
        setIsReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const usersById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const getUserById = useCallback(
    (id: string) => usersById.get(id),
    [usersById],
  )

  const findUserByPassword = useCallback(
    async (password: string): Promise<StoredUser | 'ambiguous' | null> => {
      const matches: StoredUser[] = []
      for (const u of users) {
        if (!u.active || u.accessLevel === 'guest' || !u.passwordHash) continue
        if (await verifyPassword(password, u.passwordHash)) {
          matches.push(u)
        }
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
      const passwordHash = await hashPassword(input.password)
      const newUser: StoredUser = {
        id: `user-${Date.now().toString(36)}`,
        name: input.name.trim(),
        jobTitle: input.jobTitle.trim(),
        email: input.email.trim(),
        username: input.username.trim().toLowerCase(),
        initials: input.initials?.trim() || initialsFromName(input.name),
        passwordHash,
        accessLevel: input.accessLevel,
        active: true,
      }
      setUsers((prev) => {
        const next = [...prev, newUser]
        persistUsers(next)
        return next
      })
      return newUser
    },
    [],
  )

  const updateUser = useCallback(
    async (id: string, input: UserUpdateInput): Promise<StoredUser> => {
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
            ...(input.jobTitle !== undefined && {
              jobTitle: input.jobTitle.trim(),
            }),
            ...(input.email !== undefined && { email: input.email.trim() }),
            ...(input.username !== undefined && {
              username: input.username.trim().toLowerCase(),
            }),
            ...(input.initials !== undefined && {
              initials: input.initials.trim(),
            }),
            ...(input.accessLevel !== undefined && {
              accessLevel: input.accessLevel,
            }),
            ...(input.active !== undefined && { active: input.active }),
            ...(passwordHash && { passwordHash }),
          }
          return updated
        })
        persistUsers(next)
        return next
      })
      return updated
    },
    [],
  )

  const deleteUser = useCallback((id: string) => {
    if (id === GUEST_USER_ID) return
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id)
      persistUsers(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      users,
      usersById,
      isReady,
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
      <div className="flex min-h-screen items-center justify-center bg-background font-body-md text-secondary">
        טוען משתמשים…
      </div>
    )
  }

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  )
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext)
  if (!ctx) {
    throw new Error('useUsers must be used within UsersProvider')
  }
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
