import { Archive, CheckCheck, Pencil, Rocket, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { formatIdeaDateLong, WORKFLOW_LABELS } from '../../lib/ideaUtils'
import type { Idea, IdeaWorkflowStatus } from '../../types/idea'
import { DateInput } from '../ui/DateInput'
import { ProgressBar } from '../ui/ProgressBar'
import { AssigneeSelect } from './AssigneeSelect'
import { IdeaVisibilitySelect } from './IdeaVisibilitySelect'
import { WorkflowStatusSelect } from './WorkflowStatusSelect'
import { useUsers } from '../../context/UsersContext'
import { useAuth } from '../../context/AuthContext'
import { canChangeIdeaVisibility } from '../../lib/ideaVisibility'
import { cn } from '../../lib/cn'

export interface IdeaDetailSidebarProps {
  idea: Idea
  canEdit: boolean
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
  canDelete,
  isContainer = false,
  onComplete,
  onDelete,
  onUpdate,
}: IdeaDetailSidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { listManageableUsers } = useUsers()

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
          {canEdit && !isContainer && (
            <WorkflowStatusSelect
              value={idea.workflowStatus}
              disabled={!canEdit}
              onChange={handleWorkflowChange}
            />
          )}

          {canEdit && !isContainer && idea.workflowStatus !== 'completed' && (
            <button
              type="button"
              onClick={onComplete}
              className="btn-boutique flex w-full items-center justify-center gap-2"
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
              'flex w-full items-center justify-center gap-2 rounded-xl border py-4 font-label-md transition-all active:scale-95',
              idea.sendToMaybeInbox
                ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                : 'border-inbox/30 bg-inbox-soft text-inbox hover:bg-inbox/10',
            )}
          >
            {idea.sendToMaybeInbox ? (
              <>
                <Rocket className="h-5 w-5" />
                החזר לרעיונות פעילים
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-container-low/80 py-4 font-label-md text-secondary transition-all hover:bg-surface-container active:scale-95"
            >
              <Pencil className="h-5 w-5" />
              עריכת רעיון
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2 font-label-md text-error transition-colors hover:bg-error/5"
            >
              <Trash2 className="h-5 w-5" />
              מחיקת רעיון
            </button>
          )}
        </div>

        <hr className="my-6 border-border-light/80" />

        <AssigneeSelect
          users={listManageableUsers()}
          value={idea.assigneeUserId}
          disabled={!canEdit}
          onChange={(assigneeUserId) => onUpdate({ assigneeUserId })}
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
        <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-container-low/80 shadow-card backdrop-blur-sm">
          <div className="relative h-48">
            <img
              src={idea.conceptImageUrl}
              alt="קונספט ויזואלי"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
              <span className="font-label-md text-white">קונספט ויזואלי ראשוני</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
