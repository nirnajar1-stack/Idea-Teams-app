export const APP_NAME = 'Ogen'
export const APP_NAME_FULL = 'Ogen System'
export const APP_NAME_HE = 'עוגן'
export const APP_LOGO_SRC = '/ogen-logo.png'

export const ROUTES = {
  login: '/login',
  home: '/',
  ideas: '/ideas',
  inbox: '/inbox',
  ideaDetail: (id: string) => `/ideas/${id}`,
  editIdea: (id: string) => `/ideas/${id}/edit`,
  addIdea: '/ideas/new',
  addSubIdea: (parentId: string) => `/ideas/${parentId}/sub/new`,
  profile: '/profile',
  users: '/users',
} as const

export const STORAGE_KEY = 'ideaflow-ideas-v1'
export const CLOUD_MIGRATED_KEY = 'ideaflow-cloud-migrated-v1'
export const SESSION_STORAGE_KEY = 'ideaflow-session-v1'
export const SPLASH_SHOWN_KEY = 'ideaflow-splash-shown-v1'
export const USERS_STORAGE_KEY = 'ideaflow-users-v1'
export const IDEAS_VIEW_PREFS_KEY = 'ideaflow-ideas-view-v1'

export const NAV_LABELS = {
  home: 'לוח בקרה',
  ideas: 'רעיונות',
  inbox: 'Inbox',
  profile: 'פרופיל',
  add: 'חדש',
  users: 'משתמשים',
} as const
