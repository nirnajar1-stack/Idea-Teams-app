import { Archive, CheckCheck, Pencil, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import type { Idea } from '../../types/idea'
import { cn } from '../../lib/cn'

export interface IdeaDetailMobileActionsProps {
  idea: Idea
  canEdit: boolean
  isContainer?: boolean
  onComplete: () => void
  onUpdate: (patch: Partial<Idea>) => void
}

/** Sticky thumb-zone actions above mobile bottom nav (lg:hidden). */
export function IdeaDetailMobileActions({
  idea,
  canEdit,
  isContainer = false,
  onComplete,
  onUpdate,
}: IdeaDetailMobileActionsProps) {
  const navigate = useNavigate()

  if (!canEdit) return null

  const showComplete = !isContainer && idea.workflowStatus !== 'completed'
  const showInbox = !isContainer

  return (
    <div
      className="fixed inset-x-0 z-40 border-t border-border-light bg-background/95 px-3 py-2 backdrop-blur-md lg:hidden bottom-mobile-nav"
      role="toolbar"
      aria-label="פעולות מהירות"
    >
      <div className="mx-auto flex max-w-container-max items-center gap-2">
        {showComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="btn-boutique flex min-h-12 flex-1 items-center justify-center gap-2 px-3 text-sm"
          >
            <CheckCheck className="h-5 w-5 shrink-0" aria-hidden />
            הושלם
          </button>
        )}
        {showInbox && (
          <button
            type="button"
            onClick={() => onUpdate({ sendToMaybeInbox: !idea.sendToMaybeInbox })}
            className={cn(
              'flex min-h-12 min-w-12 items-center justify-center border px-3 transition-colors',
              idea.sendToMaybeInbox
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-border-light text-secondary',
            )}
            aria-label={
              idea.sendToMaybeInbox ? 'החזר לבקשות פעילות' : 'שלח ל-Inbox'
            }
          >
            {idea.sendToMaybeInbox ? (
              <Rocket className="h-5 w-5" aria-hidden />
            ) : (
              <Archive className="h-5 w-5" aria-hidden />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(ROUTES.editIdea(idea.id))}
          className="btn-secondary-light flex min-h-12 min-w-12 items-center justify-center px-3"
          aria-label="עריכת בקשה/רעיון"
        >
          <Pencil className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
