export const APP_NAME = 'IdeaFlow'

export const ROUTES = {
  login: '/login',
  home: '/',
  ideas: '/ideas',
  inbox: '/inbox',
  ideaDetail: (id: string) => `/ideas/${id}`,
  addIdea: '/ideas/new',
  addSubIdea: (parentId: string) => `/ideas/${parentId}/sub/new`,
  profile: '/profile',
  users: '/users',
} as const

export const STORAGE_KEY = 'ideaflow-ideas-v1'
export const CLOUD_MIGRATED_KEY = 'ideaflow-cloud-migrated-v1'
export const SESSION_STORAGE_KEY = 'ideaflow-session-v1'
export const USERS_STORAGE_KEY = 'ideaflow-users-v1'
