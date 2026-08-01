import { AppShell } from '../components/layout/AppShell'
import { LinkedBoardsSection } from '../components/sections/LinkedBoardsSection'
import { RecentIdeasSection } from '../components/sections/RecentIdeasSection'
import { StatsBentoSection } from '../components/sections/StatsBentoSection'
import { TodayFocusSection } from '../components/sections/TodayFocusSection'
import { WelcomeHero } from '../components/sections/WelcomeHero'

export function HomePage() {
  return (
    <AppShell variant="main">
      <WelcomeHero />
      <TodayFocusSection />
      <StatsBentoSection />
      <LinkedBoardsSection />
      <RecentIdeasSection />
    </AppShell>
  )
}
