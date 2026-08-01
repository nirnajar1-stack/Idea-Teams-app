import { CheckCheck, ListTodo } from 'lucide-react'
import { toast } from 'sonner'
import { useGroups } from '../../context/GroupsContext'
import { useIdeas } from '../../context/IdeasContext'
import { usePermissions } from '../../context/PermissionsContext'
import { canManageExecutionWithRules } from '../../lib/permissionMatrix'
import { cn } from '../../lib/cn'
import type { AppUser } from '../../types/user'
import type { Idea, IdeaCheckCadence } from '../../types/idea'
import { CheckCadenceSelect } from './CheckCadenceSelect'

interface MasterWorkflowActionsProps {
  user: AppUser
  idea: Idea
  isContainer?: boolean
}

export function MasterWorkflowActions({
  user,
  idea,
  isContainer = false,
}: MasterWorkflowActionsProps) {
  const { toggleSentToExecution, setCheckCadence, markRoutineCheckDone } = useIdeas()
  const { myGroupIds } = useGroups()
  const { rulesByKey } = usePermissions()

  if (
    !canManageExecutionWithRules(user, idea, myGroupIds, rulesByKey) ||
    isContainer
  ) {
    return null
  }

  const handleExecutionToggle = async () => {
    const send = !idea.sentToExecution
    const ok = await toggleSentToExecution(idea.id, send)
    if (ok) {
      toast.success(send ? 'סומן לביצוע' : 'הוסר תיוג לביצוע')
    } else {
      toast.error('לא ניתן לעדכן')
    }
  }

  const handleCadenceChange = async (cadence: IdeaCheckCadence | null) => {
    const ok = await setCheckCadence(idea.id, cadence)
    if (ok) {
      toast.success(cadence ? 'הוגדרה בדיקה שוטפת' : 'הוסרה בדיקה שוטפת')
    } else {
      toast.error('לא ניתן לעדכן')
    }
  }

  const handleMarkChecked = async () => {
    const ok = await markRoutineCheckDone(idea.id)
    if (ok) toast.success('סומן כנבדק היום')
    else toast.error('לא ניתן לעדכן')
  }

  return (
    <div className="space-y-4 border border-primary/20 bg-primary/5 p-4">
      <p className="font-label-md uppercase tracking-wide text-primary">ניהול מאסטר</p>

      <button
        type="button"
        onClick={() => void handleExecutionToggle()}
        disabled={idea.workflowStatus === 'completed'}
        className={cn(
          'flex w-full items-center justify-center gap-2 border py-4 font-label-md transition-colors',
          idea.sentToExecution
            ? 'border-primary bg-primary/15 text-primary hover:bg-primary/20'
            : 'border-border-light bg-surface-container-low text-on-surface hover:border-primary/30',
        )}
      >
        <ListTodo className="h-5 w-5" />
        {idea.sentToExecution ? 'הסר תיוג לביצוע' : 'תייג לביצוע'}
      </button>

      <CheckCadenceSelect
        value={idea.checkCadence}
        disabled={idea.workflowStatus === 'completed'}
        onChange={(cadence) => void handleCadenceChange(cadence)}
      />

      {idea.checkCadence && (
        <button
          type="button"
          onClick={() => void handleMarkChecked()}
          className="btn-secondary-light flex w-full items-center justify-center gap-2 py-3 font-label-md"
        >
          <CheckCheck className="h-4 w-4" />
          סומן כנבדק היום
        </button>
      )}
    </div>
  )
}
