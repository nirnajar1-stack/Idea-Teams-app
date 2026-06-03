import { useIdeas } from '../../context/IdeasContext'
import { StatCard } from '../ui/StatCard'
import { StatusDistributionCard } from '../ui/StatusDistributionCard'

export function StatsBentoSection() {
  const { stats } = useIdeas()

  return (
    <section
      className="mb-10 grid grid-cols-1 gap-gutter md:grid-cols-12"
      aria-label="סטטיסטיקות"
    >
      <StatCard
        className="md:col-span-4"
        label="סך הרעיונות"
        value={stats.total}
        trendPercent={`${stats.monthGrowthPercent}%`}
        trendLabel="מהחודש האחרון"
      />
      <StatusDistributionCard
        className="md:col-span-8"
        title="חלוקת סטטוס"
        items={[
          {
            label: 'פיתוח',
            count: stats.developmentCount,
            percent: stats.developmentPercent,
            barClassName: 'bg-primary-container',
          },
          {
            label: 'בקרה',
            count: stats.monitoringCount,
            percent: stats.monitoringPercent,
            barClassName: 'bg-tertiary-container',
          },
        ]}
        legend={[
          { label: 'פיתוח', colorClass: 'bg-primary-container' },
          { label: 'בקרה', colorClass: 'bg-tertiary-container' },
        ]}
      />
    </section>
  )
}
