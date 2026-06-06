export type IdeaCategory = 'development' | 'monitoring'

export type IdeaPriority = 'low' | 'medium' | 'high'

export type IdeaWorkflowStatus = 'in_progress' | 'completed' | 'pending'

export type IdeaPipeline = 'active' | 'inbox' | 'all'

/** standard — רעיון רגיל; container — רעיון שמכיל תת-רעיונות (יצירה למנהל בלבד) */
export type IdeaKind = 'standard' | 'container'

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
}

export interface IdeaFilters {
  search: string
  categories: IdeaCategory[]
  priority: IdeaPriority | null
  onlyMine?: boolean
  currentUserId?: string
  pipeline?: IdeaPipeline
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
