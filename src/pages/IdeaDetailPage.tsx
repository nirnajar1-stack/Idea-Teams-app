import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useChatNotifications } from '../context/ChatNotificationsContext'
import { AppShell } from '../components/layout/AppShell'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { IdeaDetailContent } from '../components/sections/IdeaDetailContent'
import { IdeaDetailSidebar } from '../components/sections/IdeaDetailSidebar'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'
import { canAddSubIdea } from '../lib/permissions'
import { isContainerIdea, isSubIdea } from '../lib/ideaUtils'

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { hash } = useLocation()
  const navigate = useNavigate()
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
    ? `${window.location.origin}${ROUTES.ideaDetail(idea.id)}`
    : undefined

  useEffect(() => {
    if (!idea || hash !== '#idea-chat') return
    const t = window.setTimeout(() => {
      document.getElementById('idea-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      void markIdeaRead(idea.id)
    }, 300)
    return () => window.clearTimeout(t)
  }, [hash, idea, markIdeaRead])

  if (!idea) {
    return <Navigate to={ROUTES.ideas} replace />
  }

  const parent =
    isSubIdea(idea) && idea.parentId ? getIdeaById(idea.parentId) : undefined
  const subIdeas = isContainerIdea(idea) ? getSubIdeas(idea.id) : []
  const canAddSub = canAddSubIdea(user, idea)

  const handleUpdate = async (patch: Parameters<typeof updateIdea>[1]) => {
    const ok = await updateIdea(idea.id, patch)
    if (ok) toast.success('הרעיון עודכן')
    else toast.error('העדכון נכשל')
    return ok
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
        toast.success('הרעיון נמחק')
        navigate(ROUTES.ideas)
      } else {
        toast.error('המחיקה נכשלה. נסו לרענן את הדף.')
      }
    })()
  }

  return (
    <>
      <AppShell variant="back" showShare shareUrl={shareUrl}>
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <IdeaDetailContent
            idea={idea}
            parent={parent}
            subIdeas={subIdeas}
            canAddSub={canAddSub}
            canEdit={canEdit(idea)}
            onUpdate={(patch) => void handleUpdate(patch)}
          />
          <IdeaDetailSidebar
            idea={idea}
            canEdit={canEdit(idea)}
            canDelete={canDelete(idea)}
            isContainer={isContainerIdea(idea)}
            onComplete={() => void markCompleted(idea.id).then(() => toast.success('סומן כהושלם'))}
            onDelete={handleDelete}
            onUpdate={(patch) => void handleUpdate(patch)}
          />
        </div>
      </AppShell>

      <ConfirmModal
        open={deleteOpen}
        title="מחיקת רעיון"
        message="האם למחוק את הרעיון? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmModal
        open={permissionOpen}
        title="אין הרשאה"
        message="אין לך הרשאה למחוק רעיון זה."
        confirmLabel="הבנתי"
        cancelLabel="סגור"
        onConfirm={() => setPermissionOpen(false)}
        onCancel={() => setPermissionOpen(false)}
      />
    </>
  )
}
