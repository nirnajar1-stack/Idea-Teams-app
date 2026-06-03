import { AppShell } from '../components/layout/AppShell'
import { AddIdeaForm } from '../components/sections/AddIdeaForm'

export function AddIdeaPage() {
  return (
    <AppShell variant="back" maxWidth="narrow">
      <AddIdeaForm />
    </AppShell>
  )
}
