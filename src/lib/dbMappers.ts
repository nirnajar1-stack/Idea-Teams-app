import type { Idea, IdeaAttachment, IdeaKind, IdeaVisibility } from '../types/idea'
import type { AccessLevel, StoredUser } from '../types/user'

export interface AppUserRow {
  id: string
  name: string
  job_title: string
  initials: string
  email: string
  username: string
  password_hash: string
  access_level: AccessLevel
  active: boolean
}

export interface IdeaRow {
  id: string
  external_id: string
  title: string
  description: string
  category: Idea['category']
  department: string
  priority: Idea['priority']
  workflow_status: Idea['workflowStatus']
  created_at: string
  target_start_date: string
  send_to_maybe_inbox: boolean
  created_by_user_id: string
  guest_session_id: string | null
  author_name: string
  author_role: string
  author_initials: string
  tags: string[]
  goals: string[]
  attachments: IdeaAttachment[]
  progress: number
  progress_step: string
  concept_image_url: string | null
  idea_kind: IdeaKind
  parent_id: string | null
  assignee_user_id: string | null
  visibility: IdeaVisibility
}

export function userRowToStored(row: AppUserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    jobTitle: row.job_title,
    initials: row.initials,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    accessLevel: row.access_level,
    active: row.active,
  }
}

export function storedUserToRow(user: StoredUser): AppUserRow {
  return {
    id: user.id,
    name: user.name,
    job_title: user.jobTitle,
    initials: user.initials,
    email: user.email,
    username: user.username,
    password_hash: user.passwordHash,
    access_level: user.accessLevel,
    active: user.active,
  }
}

export function ideaRowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    externalId: row.external_id,
    title: row.title,
    description: row.description,
    category: row.category,
    department: row.department,
    priority: row.priority,
    workflowStatus: row.workflow_status,
    createdAt: row.created_at,
    targetStartDate: row.target_start_date,
    sendToMaybeInbox: row.send_to_maybe_inbox,
    createdByUserId: row.created_by_user_id,
    guestSessionId: row.guest_session_id ?? undefined,
    authorName: row.author_name,
    authorRole: row.author_role,
    authorInitials: row.author_initials,
    tags: row.tags ?? [],
    goals: row.goals ?? [],
    attachments: row.attachments ?? [],
    progress: row.progress,
    progressStep: row.progress_step,
    conceptImageUrl: row.concept_image_url ?? undefined,
    ideaKind: row.idea_kind,
    parentId: row.parent_id ?? undefined,
    assigneeUserId: row.assignee_user_id ?? undefined,
    visibility: row.visibility ?? 'team',
  }
}

export function ideaToRow(idea: Idea): IdeaRow {
  return {
    id: idea.id,
    external_id: idea.externalId,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    department: idea.department,
    priority: idea.priority,
    workflow_status: idea.workflowStatus,
    created_at: idea.createdAt,
    target_start_date: idea.targetStartDate,
    send_to_maybe_inbox: idea.sendToMaybeInbox,
    created_by_user_id: idea.createdByUserId,
    guest_session_id: idea.guestSessionId ?? null,
    author_name: idea.authorName,
    author_role: idea.authorRole,
    author_initials: idea.authorInitials,
    tags: idea.tags,
    goals: idea.goals,
    attachments: idea.attachments,
    progress: idea.progress,
    progress_step: idea.progressStep,
    concept_image_url: idea.conceptImageUrl ?? null,
    idea_kind: idea.ideaKind ?? 'standard',
    parent_id: idea.parentId ?? null,
    assignee_user_id: idea.assigneeUserId ?? null,
    visibility: idea.visibility ?? 'team',
  }
}

export function ideaPatchToRow(patch: Partial<Idea>): Partial<IdeaRow> {
  const row: Partial<IdeaRow> = {}
  if (patch.externalId !== undefined) row.external_id = patch.externalId
  if (patch.title !== undefined) row.title = patch.title
  if (patch.description !== undefined) row.description = patch.description
  if (patch.category !== undefined) row.category = patch.category
  if (patch.department !== undefined) row.department = patch.department
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.workflowStatus !== undefined) row.workflow_status = patch.workflowStatus
  if (patch.createdAt !== undefined) row.created_at = patch.createdAt
  if (patch.targetStartDate !== undefined) row.target_start_date = patch.targetStartDate
  if (patch.sendToMaybeInbox !== undefined) row.send_to_maybe_inbox = patch.sendToMaybeInbox
  if (patch.createdByUserId !== undefined) row.created_by_user_id = patch.createdByUserId
  if (patch.guestSessionId !== undefined) row.guest_session_id = patch.guestSessionId ?? null
  if (patch.authorName !== undefined) row.author_name = patch.authorName
  if (patch.authorRole !== undefined) row.author_role = patch.authorRole
  if (patch.authorInitials !== undefined) row.author_initials = patch.authorInitials
  if (patch.tags !== undefined) row.tags = patch.tags
  if (patch.goals !== undefined) row.goals = patch.goals
  if (patch.attachments !== undefined) row.attachments = patch.attachments
  if (patch.progress !== undefined) row.progress = patch.progress
  if (patch.progressStep !== undefined) row.progress_step = patch.progressStep
  if (patch.conceptImageUrl !== undefined) row.concept_image_url = patch.conceptImageUrl ?? null
  if (patch.ideaKind !== undefined) row.idea_kind = patch.ideaKind
  if (patch.parentId !== undefined) row.parent_id = patch.parentId ?? null
  if (patch.assigneeUserId !== undefined) row.assignee_user_id = patch.assigneeUserId ?? null
  if (patch.visibility !== undefined) row.visibility = patch.visibility
  return row
}
