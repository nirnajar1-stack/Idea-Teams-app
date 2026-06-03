export type UserId = 'nir' | 'golan'

export interface AppUser {
  id: UserId
  name: string
  role: string
  initials: string
  email: string
}
