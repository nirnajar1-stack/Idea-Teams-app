import { AppShell } from '../components/layout/AppShell'
import { RecentIdeasSection } from '../components/sections/RecentIdeasSection'
import { StatsBentoSection } from '../components/sections/StatsBentoSection'
import { WelcomeHero } from '../components/sections/WelcomeHero'

export function HomePage() {
  return (
    <AppShell variant="main">
      <WelcomeHero />
      <StatsBentoSection />
      <RecentIdeasSection />
    </AppShell>
  )
}
