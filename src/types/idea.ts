export type IdeaCategory = 'development' | 'monitoring'

export type IdeaPriority = 'low' | 'medium' | 'high'

export type IdeaWorkflowStatus = 'in_progress' | 'completed' | 'pending'

export type IdeaPipeline = 'active' | 'inbox' | 'all'

/** active — לא הושלמו | completed — הושלמו בלבד | all — הכל */
export type IdeaWorkflowFilter = 'active' | 'completed' | 'all'

export type IdeaSortOption = 'date_desc' | 'priority_desc' | 'author_asc'

export interface IdeasViewPrefs {
  compact: boolean
  sort: IdeaSortOption
}

/** standard — רעיון רגיל; container — רעיון שמכיל תת-רעיונות (יצירה למנהל בלבד) */
export type IdeaKind = 'standard' | 'container'

/** team — כולם | managers_only — מנהלים+מאסטר | master_private — מאסטר יוצר בלבד */
export type IdeaVisibility = 'team' | 'managers_only' | 'master_private'

export interface IdeaAttachment {
  id: string
  name: string
  type: 'pdf' | 'image'
  /** URL ב-Supabase Storage (אופציונלי) */
  url?: string
}

export interface Idea {
  id: string
  externalId: string
  title: string
  description: string
  category: IdeaCategory
  department: string
  priority: IdeaPriority
  workflowStatus: IdeaWorkflowStatus
  createdAt: string
  targetStartDate: string
  sendToMaybeInbox: boolean
  createdByUserId: string
  guestSessionId?: string
  authorName: string
  authorRole: string
  authorInitials: string
  tags: string[]
  goals: string[]
  attachments: IdeaAttachment[]
  progress: number
  progressStep: string
  conceptImageUrl?: string
  ideaKind?: IdeaKind
  /** מזהה רעיון-אב (תת-רעיון בלבד) */
  parentId?: string
  /** משתמש מוקצה לביצוע הרעיון */
  assigneeUserId?: string
  /** מי רואה את הרעיון — ברירת מחדל team */
  visibility?: IdeaVisibility
}

export interface IdeaFormInput {
  title: string
  description: string
  category: IdeaCategory
  priority: IdeaPriority
  targetStartDate: string
  sendToMaybeInbox: boolean
  ideaKind?: IdeaKind
  parentId?: string
  visibility?: IdeaVisibility
}

export interface IdeaFilters {
  search: string
  categories: IdeaCategory[]
  priority: IdeaPriority | null
  onlyMine?: boolean
  currentUserId?: string
  pipeline?: IdeaPipeline
  workflow?: IdeaWorkflowFilter
}

export interface IdeasStats {
  total: number
  activeCount: number
  inboxCount: number
  developmentCount: number
  monitoringCount: number
  developmentPercent: number
  monitoringPercent: number
  monthGrowthPercent: number
}
