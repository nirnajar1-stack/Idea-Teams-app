export const APP_NAME = 'Ogen'
export const APP_TAGLINE = 'צוות פיתוח ובקרה'
export const APP_NAME_FULL = `Ogen — ${APP_TAGLINE}`
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
  timeline: '/timeline',
  labels: '/labels',
  groups: '/groups',
  emailLog: '/email-log',
  openTasksDashboard: '/insights/open-tasks',
  permissions: '/permissions',
  boards: '/boards',
  boardsManage: '/boards/manage',
  boardDetail: (id: string) => `/boards/${id}`,
} as const

/** נתיבים לשילוב ב-Power BI (iframe) */
export const EMBED_ROUTES = {
  login: '/embed/login',
  home: '/embed',
  ideas: '/embed/ideas',
  timeline: '/embed/timeline',
  ideaDetail: (id: string) => `/embed/ideas/${id}`,
} as const

export const STORAGE_KEY = 'ideaflow-ideas-v1'
export const CLOUD_MIGRATED_KEY = 'ideaflow-cloud-migrated-v1'
export const SESSION_STORAGE_KEY = 'ideaflow-session-v1'
export const SPLASH_SHOWN_KEY = 'ideaflow-splash-shown-v1'
export const MONTHLY_INTRO_VIDEO_KEY = 'ogen-monthly-intro-video-v1'
/** @deprecated use MONTHLY_INTRO_VIDEO_KEY */
export const DAILY_INTRO_VIDEO_KEY = MONTHLY_INTRO_VIDEO_KEY
/** קובץ ב-public — נתיב מקודד לתמיכה בשם עברי */
export const INTRO_VIDEO_SRC = encodeURI('/פרויקט וידאו.mp4')
export const USERS_STORAGE_KEY = 'ideaflow-users-v1'
export const IDEAS_VIEW_PREFS_KEY = 'ideaflow-ideas-view-v1'
export const IDEAS_FILTERS_KEY = 'ideaflow-ideas-filters-v1'

export const NAV_LABELS = {
  home: 'לוח בקרה',
  ideas: 'בקשות/רעיונות',
  inbox: 'Inbox',
  profile: 'פרופיל',
  add: 'חדש',
  users: 'משתמשים',
  timeline: 'טיימליין',
  labels: 'לייבלים',
  groups: 'קבוצות',
  emailLog: 'יומן מיילים',
  openTasks: 'משימות פתוחות',
  manage: 'ניהול',
  permissions: 'הרשאות',
  boards: 'לוחות',
} as const
