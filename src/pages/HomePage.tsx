import { AppShell } from '../components/layout/AppShell'
import { LinkedBoardsSection } from '../components/sections/LinkedBoardsSection'
import { RecentIdeasSection } from '../components/sections/RecentIdeasSection'
import { OpenTasksDashboardSection } from '../components/sections/OpenTasksDashboardSection'
import { StatsBentoSection } from '../components/sections/StatsBentoSection'
import { WelcomeHero } from '../components/sections/WelcomeHero'

export function HomePage() {
  return (
    <AppShell variant="main">
      <WelcomeHero />
      <StatsBentoSection />
      <OpenTasksDashboardSection variant="snapshot" />
      <LinkedBoardsSection />
      <RecentIdeasSection />
    </AppShell>
  )
}
