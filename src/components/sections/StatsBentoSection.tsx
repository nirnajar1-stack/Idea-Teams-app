import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { StatCard } from '../ui/StatCard'
import { StatusDistributionCard } from '../ui/StatusDistributionCard'

export function StatsBentoSection() {
  const { stats } = useIdeas()

  return (
    <section
      className="lambo-stagger mb-5 grid grid-cols-1 gap-3 md:mb-6 md:grid-cols-12 md:gap-4"
      aria-label="סטטיסטיקות"
    >
      <StatCard
        className="md:col-span-4"
        label="בקשות/רעיונות פעילים"
        value={stats.activeCount}
        trendPercent={`${stats.monthGrowthPercent}%`}
        trendLabel="מהחודש האחרון"
      />
      <Link
        to={ROUTES.inbox}
        className="glass-card-hover group flex flex-col justify-between p-4 md:col-span-4 md:p-5"
      >
        <div>
          <p className="mb-1 text-label-sm uppercase text-secondary">Inbox</p>
          <p className="stat-value font-display text-[2rem] leading-none md:text-display-lg">
            {stats.inboxCount}
          </p>
        </div>
        <p className="mt-4 border-t border-border-light pt-3 text-body-sm text-secondary transition-colors duration-300 group-hover:text-primary">
          לבחינה עתידית ←
        </p>
      </Link>
      <StatusDistributionCard
        className="md:col-span-4"
        title="חלוקת סטטוס"
        items={[
          {
            label: 'פיתוח',
            count: stats.developmentCount,
            percent: stats.developmentPercent,
            barClassName: 'bg-primary',
          },
          {
            label: 'בקרה',
            count: stats.monitoringCount,
            percent: stats.monitoringPercent,
            barClassName: 'bg-surface-container-high',
          },
          {
            label: 'טכני',
            count: stats.technicalCount,
            percent: stats.technicalPercent,
            barClassName: 'bg-teal-action',
          },
        ]}
        legend={[
          { label: 'פיתוח', colorClass: 'bg-primary-container' },
          { label: 'בקרה', colorClass: 'bg-tertiary-container' },
          { label: 'טכני', colorClass: 'bg-teal-action' },
        ]}
      />
    </section>
  )
}
