export const APP_NAME = 'IdeaFlow'

export const ROUTES = {
  login: '/login',
  home: '/',
  ideas: '/ideas',
  inbox: '/inbox',
  ideaDetail: (id: string) => `/ideas/${id}`,
  addIdea: '/ideas/new',
  profile: '/profile',
} as const

export const STORAGE_KEY = 'ideaflow-ideas-v1'
export const SESSION_STORAGE_KEY = 'ideaflow-session-v1'
