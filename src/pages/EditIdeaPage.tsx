import { Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EditIdeaForm } from '../components/sections/EditIdeaForm'
import { useIdeas } from '../context/IdeasContext'
import { ROUTES } from '../constants/app'

export function EditIdeaPage() {
  const { id } = useParams<{ id: string }>()
  const { getIdeaById, canEdit } = useIdeas()
  const idea = id ? getIdeaById(id) : undefined

  if (!idea) {
    return <Navigate to={ROUTES.ideas} replace />
  }

  if (!canEdit(idea)) {
    return <Navigate to={ROUTES.ideaDetail(idea.id)} replace />
  }

  return (
    <AppShell variant="back" maxWidth="narrow">
      <EditIdeaForm idea={idea} />
    </AppShell>
  )
}
