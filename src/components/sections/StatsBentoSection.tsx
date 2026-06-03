import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
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
        className="animate-fade-up md:col-span-4"
        label="רעיונות פעילים"
        value={stats.activeCount}
        trendPercent={`${stats.monthGrowthPercent}%`}
        trendLabel="מהחודש האחרון"
      />
      <Link
        to={ROUTES.inbox}
        className="glass-card-hover group flex flex-col justify-between p-8 animate-fade-up md:col-span-4"
        style={{ animationDelay: '60ms' }}
      >
        <div>
          <p className="mb-1 font-label-md text-inbox">Inbox · אולי בהמשך</p>
          <p className="font-display text-display-lg leading-none text-inbox">
            {stats.inboxCount}
          </p>
        </div>
        <p className="mt-6 font-label-sm text-secondary transition-colors group-hover:text-inbox">
          רעיונות לבחינה עתידית ←
        </p>
      </Link>
      <StatusDistributionCard
        className="animate-fade-up md:col-span-4"
        style={{ animationDelay: '120ms' }}
        title="חלוקת סטטוס"
        items={[
          {
            label: 'פיתוח',
            count: stats.developmentCount,
            percent: stats.developmentPercent,
            barClassName: 'bg-gradient-to-l from-primary-container to-primary',
          },
          {
            label: 'בקרה',
            count: stats.monitoringCount,
            percent: stats.monitoringPercent,
            barClassName: 'bg-gradient-to-l from-tertiary-container to-tertiary',
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
