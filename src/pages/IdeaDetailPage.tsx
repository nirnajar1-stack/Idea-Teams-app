import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { IdeaDetailContent } from '../components/sections/IdeaDetailContent'
import { IdeaDetailSidebar } from '../components/sections/IdeaDetailSidebar'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getIdeaById, markCompleted, deleteIdea, updateIdea } = useIdeas()

  const idea = id ? getIdeaById(id) : undefined

  if (!idea) {
    return <Navigate to={ROUTES.ideas} replace />
  }

  const handleDelete = () => {
    if (window.confirm('האם למחוק את הרעיון?')) {
      deleteIdea(idea.id)
      navigate(ROUTES.ideas)
    }
  }

  return (
    <AppShell variant="back" showShare>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <IdeaDetailContent idea={idea} />
        <IdeaDetailSidebar
          idea={idea}
          onComplete={() => markCompleted(idea.id)}
          onDelete={handleDelete}
          onUpdate={(patch) => updateIdea(idea.id, patch)}
        />
      </div>
    </AppShell>
  )
}
