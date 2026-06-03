import { AppShell } from '../components/layout/AppShell'
import { AddIdeaForm } from '../components/sections/AddIdeaForm'
import { CURRENT_USER } from '../constants/app'

export function AddIdeaPage() {
  return (
    <AppShell variant="back" maxWidth="narrow" connectedAs={CURRENT_USER.displayName}>
      <AddIdeaForm />
    </AppShell>
  )
}
