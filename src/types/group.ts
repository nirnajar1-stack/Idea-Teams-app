export interface AppGroup {
  id: string
  name: string
  active: boolean
  createdAt: string
  createdByUserId?: string
  memberIds: string[]
}

export interface AppGroupInput {
  name: string
  memberIds: string[]
}

export const GROUPS_STORAGE_KEY = 'ogen-app-groups-v1'
