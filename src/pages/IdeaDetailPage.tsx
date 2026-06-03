import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaDetailContent } from '../components/sections/IdeaDetailContent'
import { IdeaDetailSidebar } from '../components/sections/IdeaDetailSidebar'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'
import { canAddSubIdea } from '../lib/permissions'
import { isContainerIdea, isSubIdea } from '../lib/ideaUtils'

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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

  const idea = id ? getIdeaById(id) : undefined

  if (!idea) {
    return <Navigate to={ROUTES.ideas} replace />
  }

  const parent =
    isSubIdea(idea) && idea.parentId ? getIdeaById(idea.parentId) : undefined
  const subIdeas = isContainerIdea(idea) ? getSubIdeas(idea.id) : []
  const canAddSub = canAddSubIdea(user, idea)

  const handleDelete = () => {
    if (!canDelete(idea)) return
    if (window.confirm('האם למחוק את הרעיון?')) {
      if (deleteIdea(idea.id)) {
        navigate(ROUTES.ideas)
      }
    }
  }

  return (
    <AppShell variant="back" showShare>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <IdeaDetailContent
          idea={idea}
          parent={parent}
          subIdeas={subIdeas}
          canAddSub={canAddSub}
        />
        <IdeaDetailSidebar
          idea={idea}
          canEdit={canEdit(idea)}
          canDelete={canDelete(idea)}
          isContainer={isContainerIdea(idea)}
          onComplete={() => markCompleted(idea.id)}
          onDelete={handleDelete}
          onUpdate={(patch) => updateIdea(idea.id, patch)}
        />
      </div>
    </AppShell>
  )
}
