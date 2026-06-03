export type IdeaCategory = 'development' | 'monitoring'

export type IdeaPriority = 'low' | 'medium' | 'high'

export type IdeaWorkflowStatus = 'in_progress' | 'completed' | 'pending'

export interface IdeaAttachment {
  id: string
  name: string
  type: 'pdf' | 'image'
}

import type { UserId } from './user'

export type { UserId }

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
  createdByUserId: UserId
  authorName: string
  authorRole: string
  authorInitials: string
  tags: string[]
  goals: string[]
  attachments: IdeaAttachment[]
  progress: number
  progressStep: string
  conceptImageUrl?: string
}

export interface IdeaFormInput {
  title: string
  description: string
  category: IdeaCategory
  priority: IdeaPriority
}

export interface IdeaFilters {
  search: string
  categories: IdeaCategory[]
  priority: IdeaPriority | null
  onlyMine?: boolean
  currentUserId?: UserId
}

export interface IdeasStats {
  total: number
  developmentCount: number
  monitoringCount: number
  developmentPercent: number
  monitoringPercent: number
  monthGrowthPercent: number
}
