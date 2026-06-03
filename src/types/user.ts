export type AccessLevel = 'manager' | 'member' | 'guest'

/** תווית תפקיד במערכת — ללא מינוח "מנהל מערכת" */
export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  manager: 'מנהל',
  member: 'משתמש',
  guest: 'אורח',
}

export interface AppUser {
  id: string
  name: string
  jobTitle: string
  initials: string
  email: string
  username: string
  accessLevel: AccessLevel
  active: boolean
  /** מזהה סשן לאורח — רעיונות נראים רק באותה כניסה */
  guestSessionId?: string
}

export interface StoredUser extends AppUser {
  passwordHash: string
}

export interface AuthSession {
  userId: string
  guestSessionId?: string
}

export interface UserFormInput {
  name: string
  jobTitle: string
  email: string
  username: string
  password: string
  accessLevel: Exclude<AccessLevel, 'guest'>
  initials?: string
}

export interface UserUpdateInput {
  name?: string
  jobTitle?: string
  email?: string
  username?: string
  password?: string
  accessLevel?: Exclude<AccessLevel, 'guest'>
  active?: boolean
  initials?: string
}
