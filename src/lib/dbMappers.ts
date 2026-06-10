import type { Idea, IdeaAttachment, IdeaKind, IdeaVisibility } from '../types/idea'
import type { AccessLevel, StoredUser, UserUpdateInput } from '../types/user'

export interface AppUserRow {
  id: string
  name: string
  job_title: string
  initials: string
  email: string
  username: string
  phone: string | null
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
  idea_source: Idea['ideaSource']
  priority: Idea['priority']
  workflow_status: Idea['workflowStatus']
  created_at: string
  target_start_date: string
  planned_date: string | null
  send_to_maybe_inbox: boolean
  sent_to_execution: boolean
  sent_to_execution_at: string | null
  check_cadence: Idea['checkCadence']
  last_checked_at: string | null
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
    phone: row.phone ?? undefined,
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
    phone: user.phone ?? null,
    password_hash: user.passwordHash,
    access_level: user.accessLevel,
    active: user.active,
  }
}

/** patch חלקי לעדכון משתמש — לא שולח password_hash אלא אם הוחלפה סיסמה */
export function userUpdateInputToRow(
  input: UserUpdateInput,
  passwordHash?: string,
): Partial<AppUserRow> {
  const row: Partial<AppUserRow> = {}
  if (input.name !== undefined) row.name = input.name.trim()
  if (input.jobTitle !== undefined) row.job_title = input.jobTitle.trim()
  if (input.email !== undefined) row.email = input.email.trim()
  if (input.username !== undefined) row.username = input.username.trim().toLowerCase()
  if (input.initials !== undefined) row.initials = input.initials.trim()
  if (input.accessLevel !== undefined) row.access_level = input.accessLevel
  if (input.active !== undefined) row.active = input.active
  if (passwordHash) row.password_hash = passwordHash
  return row
}

export function ideaRowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    externalId: row.external_id,
    title: row.title,
    description: row.description,
    category: row.category,
    department: row.department,
    ideaSource: row.idea_source ?? 'mitamim',
    priority: row.priority,
    workflowStatus: row.workflow_status,
    createdAt: row.created_at,
    targetStartDate: row.target_start_date,
    plannedDate: row.planned_date ?? undefined,
    sendToMaybeInbox: row.send_to_maybe_inbox,
    sentToExecution: row.sent_to_execution ?? false,
    sentToExecutionAt: row.sent_to_execution_at ?? undefined,
    checkCadence: row.check_cadence ?? undefined,
    lastCheckedAt: row.last_checked_at ?? undefined,
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
    idea_source: idea.ideaSource,
    priority: idea.priority,
    workflow_status: idea.workflowStatus,
    created_at: idea.createdAt,
    target_start_date: idea.targetStartDate,
    planned_date: idea.plannedDate ?? null,
    send_to_maybe_inbox: idea.sendToMaybeInbox,
    sent_to_execution: idea.sentToExecution ?? false,
    sent_to_execution_at: idea.sentToExecutionAt ?? null,
    check_cadence: idea.checkCadence ?? null,
    last_checked_at: idea.lastCheckedAt ?? null,
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
  if (patch.ideaSource !== undefined) row.idea_source = patch.ideaSource
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.workflowStatus !== undefined) row.workflow_status = patch.workflowStatus
  if (patch.createdAt !== undefined) row.created_at = patch.createdAt
  if (patch.targetStartDate !== undefined) row.target_start_date = patch.targetStartDate
  if (patch.plannedDate !== undefined) row.planned_date = patch.plannedDate ?? null
  if (patch.sendToMaybeInbox !== undefined) row.send_to_maybe_inbox = patch.sendToMaybeInbox
  if (patch.sentToExecution !== undefined) row.sent_to_execution = patch.sentToExecution
  if (patch.sentToExecutionAt !== undefined) row.sent_to_execution_at = patch.sentToExecutionAt ?? null
  if (patch.checkCadence !== undefined) row.check_cadence = patch.checkCadence ?? null
  if (patch.lastCheckedAt !== undefined) row.last_checked_at = patch.lastCheckedAt ?? null
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
