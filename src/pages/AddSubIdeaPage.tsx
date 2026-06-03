import { Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AddSubIdeaForm } from '../components/sections/AddSubIdeaForm'
import { ROUTES } from '../constants/app'
import { useIdeas } from '../context/IdeasContext'
import { canAddSubIdea } from '../lib/permissions'
import { isContainerIdea } from '../lib/ideaUtils'
import { useAuth } from '../context/AuthContext'

export function AddSubIdeaPage() {
  const { parentId } = useParams<{ parentId: string }>()
  const { user } = useAuth()
  const { getIdeaById } = useIdeas()

  const parent = parentId ? getIdeaById(parentId) : undefined

  if (!parent || !isContainerIdea(parent)) {
    return <Navigate to={ROUTES.ideas} replace />
  }

  if (!canAddSubIdea(user, parent)) {
    return <Navigate to={ROUTES.ideaDetail(parent.id)} replace />
  }

  return (
    <AppShell variant="back" maxWidth="narrow">
      <AddSubIdeaForm parent={parent} />
    </AppShell>
  )
}
