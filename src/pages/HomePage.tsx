import { AppShell } from '../components/layout/AppShell'
import { RecentIdeasSection } from '../components/sections/RecentIdeasSection'
import { OpenTasksDashboardSection } from '../components/sections/OpenTasksDashboardSection'
import { StatsBentoSection } from '../components/sections/StatsBentoSection'
import { WelcomeHero } from '../components/sections/WelcomeHero'

export function HomePage() {
  return (
    <AppShell variant="main">
      <WelcomeHero />
      <div className="lambo-section">
        <StatsBentoSection />
      </div>
      <OpenTasksDashboardSection />
      <RecentIdeasSection />
    </AppShell>
  )
}
