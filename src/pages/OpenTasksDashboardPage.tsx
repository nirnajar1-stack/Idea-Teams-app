import { AppShell } from '../components/layout/AppShell'
import { OpenTasksDashboardSection } from '../components/sections/OpenTasksDashboardSection'
import { OpenTasksHighPriorityList } from '../components/sections/OpenTasksHighPriorityList'

export function OpenTasksDashboardPage() {
  return (
    <AppShell variant="main">
      <div className="mb-4 text-right">
        <span className="section-eyebrow">ניהול תפוקה</span>
        <h1 className="font-display text-headline-lg text-on-surface">משימות פתוחות</h1>
        <p className="mt-2 font-body-md text-secondary">
          תצוגה מלאה של פילוחים, תובנות ומשימות דחופות
        </p>
      </div>
      <OpenTasksDashboardSection showFullViewLink={false} />
      <OpenTasksHighPriorityList />
    </AppShell>
  )
}
