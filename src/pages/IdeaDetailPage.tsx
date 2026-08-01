import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { completionNotifyToasts } from '../lib/emailNotifyFeedback'
import { useChatNotifications } from '../context/ChatNotificationsContext'
import { AppShell } from '../components/layout/AppShell'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { IdeaDetailContent } from '../components/sections/IdeaDetailContent'
import { IdeaDetailMobileActions } from '../components/sections/IdeaDetailMobileActions'
import { IdeaDetailSidebar } from '../components/sections/IdeaDetailSidebar'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { useAppRoutes, useEmbedMode } from '../context/EmbedModeContext'
import { canAddSubIdea } from '../lib/permissions'
import { isContainerIdea, isSubIdea } from '../lib/ideaUtils'

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const routes = useAppRoutes()
  const { isEmbed } = useEmbedMode()
  const { markIdeaRead } = useChatNotifications()
  const { user } = useAuth()
  const {
    getIdeaById,
    getSubIdeas,
    markCompleted,
    deleteIdea,
    updateIdea,
    canDelete,
    canEdit,
  } = useIdeas()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissionOpen, setPermissionOpen] = useState(false)

  const idea = id ? getIdeaById(id) : undefined
  const shareUrl = idea
    ? `${window.location.origin}${routes.ideaDetail(idea.id)}`
    : undefined
  const editable = idea ? canEdit(idea) : false

  const handleComplete = () => {
    if (!idea) return
    void markCompleted(idea.id).then((result) => {
      if (!result.ok) {
        toast.error('העדכון נכשל')
        return
      }
      toast.success('סומן כהושלם')
      if (result.emailNotify) {
        for (const t of completionNotifyToasts(result.emailNotify)) {
          if (t.level === 'message') toast.message(t.text)
          else toast.warning(t.text)
        }
      }
    })
  }

  useEffect(() => {
    if (!idea || hash !== '#idea-chat') return
    const t = window.setTimeout(() => {
      document.getElementById('idea-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      void markIdeaRead(idea.id)
    }, 300)
    return () => window.clearTimeout(t)
  }, [hash, idea, markIdeaRead])

  if (!idea) {
    return <Navigate to={routes.ideas} replace />
  }

  const parent =
    isSubIdea(idea) && idea.parentId ? getIdeaById(idea.parentId) : undefined
  const subIdeas = isContainerIdea(idea) ? getSubIdeas(idea.id) : []
  const canAddSub = canAddSubIdea(user, idea)

  const handleUpdate = async (patch: Parameters<typeof updateIdea>[1]) => {
    const result = await updateIdea(idea.id, patch)
    if (result.ok) {
      toast.success('הבקשה/רעיון עודכן')
      if (result.emailNotify) {
        for (const t of completionNotifyToasts(result.emailNotify)) {
          if (t.level === 'message') toast.message(t.text)
          else toast.warning(t.text)
        }
      }
    } else {
      toast.error('העדכון נכשל')
    }
    return result.ok
  }

  const handleDelete = () => {
    if (!canDelete(idea)) {
      setPermissionOpen(true)
      return
    }
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    setDeleteOpen(false)
    void (async () => {
      if (await deleteIdea(idea.id)) {
        toast.success('הבקשה/רעיון נמחק')
        navigate(routes.ideas)
      } else {
        toast.error('המחיקה נכשלה. נסו לרענן את הדף.')
      }
    })()
  }

  return (
    <>
      <AppShell variant="back" showShare shareUrl={shareUrl}>
        <div
          className={
            editable
              ? 'grid grid-cols-1 gap-gutter pb-20 lg:grid-cols-12 lg:pb-0'
              : 'grid grid-cols-1 gap-gutter lg:grid-cols-12'
          }
        >
          <IdeaDetailContent
            idea={idea}
            parent={parent}
            subIdeas={subIdeas}
            canAddSub={canAddSub}
            canEdit={editable}
            onUpdate={(patch) => void handleUpdate(patch)}
          />
          <IdeaDetailSidebar
            idea={idea}
            canEdit={editable}
            canDelete={canDelete(idea)}
            isContainer={isContainerIdea(idea)}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onUpdate={(patch) => void handleUpdate(patch)}
          />
        </div>
      </AppShell>

      {!isEmbed && (
        <IdeaDetailMobileActions
          idea={idea}
          canEdit={editable}
          isContainer={isContainerIdea(idea)}
          onComplete={handleComplete}
          onUpdate={(patch) => void handleUpdate(patch)}
        />
      )}

      <ConfirmModal
        open={deleteOpen}
        title="מחיקת בקשה/רעיון"
        message="האם למחוק את הבקשה/רעיון? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmModal
        open={permissionOpen}
        title="אין הרשאה"
        message="אין לך הרשאה למחוק בקשה/רעיון זה."
        confirmLabel="הבנתי"
        cancelLabel="סגור"
        onConfirm={() => setPermissionOpen(false)}
        onCancel={() => setPermissionOpen(false)}
      />
    </>
  )
}
