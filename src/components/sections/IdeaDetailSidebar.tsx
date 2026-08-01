import { Archive, CheckCheck, Pencil, Rocket, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { formatIdeaDateLong, WORKFLOW_LABELS } from '../../lib/ideaUtils'
import type { Idea, IdeaWorkflowStatus } from '../../types/idea'
import { DateInput } from '../ui/DateInput'
import { ProgressBar } from '../ui/ProgressBar'
import { AssigneeSelect } from './AssigneeSelect'
import { IdeaVisibilitySelect } from './IdeaVisibilitySelect'
import { MasterWorkflowActions } from './MasterWorkflowActions'
import { WorkflowStatusSelect } from './WorkflowStatusSelect'
import { useUsers } from '../../context/UsersContext'
import { useGroups } from '../../context/GroupsContext'
import { useAuth } from '../../context/AuthContext'
import { useEmbedMode } from '../../context/EmbedModeContext'
import { canChangeIdeaVisibility } from '../../lib/ideaVisibility'
import { cn } from '../../lib/cn'

export interface IdeaDetailSidebarProps {
  idea: Idea
  canEdit: boolean
  canComplete?: boolean
  canDelete: boolean
  isContainer?: boolean
  onComplete: () => void
  onDelete: () => void
  onUpdate: (patch: Partial<Idea>) => void
}

function workflowPatch(status: IdeaWorkflowStatus): Partial<Idea> {
  if (status === 'completed') {
    return { workflowStatus: status, progress: 100, progressStep: WORKFLOW_LABELS.completed }
  }
  if (status === 'in_progress') {
    return { workflowStatus: status, progressStep: WORKFLOW_LABELS.in_progress }
  }
  return { workflowStatus: status, progressStep: WORKFLOW_LABELS.pending }
}

export function IdeaDetailSidebar({
  idea,
  canEdit,
  canComplete = canEdit,
  canDelete,
  isContainer = false,
  onComplete,
  onDelete,
  onUpdate,
}: IdeaDetailSidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isEmbed } = useEmbedMode()
  const { listManageableUsers } = useUsers()
  const { groups } = useGroups()
  /** Sticky bar covers these on mobile; keep them visible in embed (no sticky). */
  const primaryActionClass = isEmbed ? 'flex' : 'hidden lg:flex'

  const handleWorkflowChange = (status: IdeaWorkflowStatus) => {
    if (status === 'completed') {
      onComplete()
      return
    }
    onUpdate(workflowPatch(status))
  }

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="sticky top-24 glass-card p-6">
        <h3 className="mb-6 font-display text-headline-md text-on-surface">פעולות</h3>
        <div className="space-y-4">
          {user && (
            <MasterWorkflowActions user={user} idea={idea} isContainer={isContainer} />
          )}

          {(canEdit || canComplete) && !isContainer && (
            <WorkflowStatusSelect
              value={idea.workflowStatus}
              disabled={!canEdit && !canComplete}
              onChange={handleWorkflowChange}
            />
          )}

          {canComplete && !isContainer && idea.workflowStatus !== 'completed' && (
            <button
              type="button"
              onClick={onComplete}
              className={cn('btn-boutique w-full items-center justify-center gap-2', primaryActionClass)}
            >
              <CheckCheck className="h-5 w-5" />
              סימון כהושלם
            </button>
          )}

          {canEdit && !isContainer && (
          <button
            type="button"
            onClick={() =>
              onUpdate({ sendToMaybeInbox: !idea.sendToMaybeInbox })
            }
            className={cn(
              'w-full items-center justify-center gap-2 border py-4 font-label-md transition-colors',
              primaryActionClass,
              idea.sendToMaybeInbox
                ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                : 'border-inbox/30 bg-inbox-soft text-inbox hover:bg-inbox/10',
            )}
          >
            {idea.sendToMaybeInbox ? (
              <>
                <Rocket className="h-5 w-5" />
                החזר לבקשות/רעיונות פעילים
              </>
            ) : (
              <>
                <Archive className="h-5 w-5" />
                שלח ל-Inbox (אולי בהמשך)
              </>
            )}
          </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.editIdea(idea.id))}
              className={cn(
                'btn-secondary-light w-full items-center justify-center gap-2 py-4 font-label-md',
                primaryActionClass,
              )}
            >
              <Pencil className="h-5 w-5" />
              עריכת בקשה/רעיון
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 py-2 font-label-md text-error transition-colors hover:bg-error/5"
            >
              <Trash2 className="h-5 w-5" />
              מחיקת בקשה/רעיון
            </button>
          )}
        </div>

        <hr className="my-6 border-border-light/80" />

        <AssigneeSelect
          users={listManageableUsers()}
          groups={groups}
          userIds={idea.assigneeUserIds?.length
            ? idea.assigneeUserIds
            : idea.assigneeUserId
              ? [idea.assigneeUserId]
              : []}
          groupIds={idea.assigneeGroupIds ?? []}
          disabled={!canEdit}
          onChange={({ userIds, groupIds }) =>
            onUpdate({
              assigneeUserIds: userIds,
              assigneeGroupIds: groupIds,
              assigneeUserId: userIds[0],
            })
          }
        />

        {user && canChangeIdeaVisibility(user, idea) && (
          <div className="mt-6">
            <IdeaVisibilitySelect
              user={user}
              value={idea.visibility ?? 'team'}
              disabled={!canEdit}
              onChange={(visibility) => onUpdate({ visibility })}
            />
          </div>
        )}

        <hr className="my-6 border-border-light/80" />

        <DateInput
          label="תאריך יעד להתחלה"
          value={idea.targetStartDate}
          onChange={(e) => onUpdate({ targetStartDate: e.target.value })}
          hint={`עודכן: ${formatIdeaDateLong(idea.createdAt)} נוצר`}
          disabled={!canEdit}
        />

        <div className="mt-8">
          <h4 className="mb-4 font-label-md uppercase text-secondary">התקדמות</h4>
          <ProgressBar
            percent={idea.progress}
            label={`${idea.progress}% הושלם`}
            stepLabel={idea.progressStep}
          />
        </div>
      </div>

      {idea.conceptImageUrl && (
        <div className="overflow-hidden border border-border-light bg-surface-container-low/80 backdrop-blur-sm">
          <div className="relative h-48">
            <img
              src={idea.conceptImageUrl}
              alt="קונספט ויזואלי"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-black/70 p-4">
              <span className="font-label-md text-white">קונספט ויזואלי ראשוני</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
