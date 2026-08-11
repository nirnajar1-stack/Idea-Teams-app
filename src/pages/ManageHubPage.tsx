import { Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { buildNavContext, splitVisibleNavItems } from '../config/appNavigation'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupsContext'
import { usePermissions } from '../context/PermissionsContext'
import { cn } from '../lib/cn'

export function ManageHubPage() {
  const { user } = useAuth()
  const { myGroupIds } = useGroups()
  const { rulesByKey } = usePermissions()
  const { manage } = splitVisibleNavItems(
    buildNavContext(user, myGroupIds, rulesByKey),
  )

  return (
    <AppShell variant="main">
      <header className="mb-6 text-right">
        <span className="section-eyebrow">ניהול מערכת</span>
        <h1 className="mt-1 flex items-center justify-end gap-2 font-display text-headline-lg text-on-surface">
          <Settings2 className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          ניהול
        </h1>
        <p className="mt-1 text-body-sm text-secondary">
          בחרו מסך לניהול משתמשים, קבוצות, הרשאות ועוד.
        </p>
      </header>

      {manage.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-light bg-surface-subtle px-4 py-6 text-center text-body-sm text-secondary">
          אין פריטי ניהול זמינים עבור המשתמש הנוכחי.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {manage.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'flex min-h-16 items-center gap-3 rounded-[1.35rem] border border-border-light',
                  'bg-surface-container-lowest px-4 py-4 text-on-surface shadow-soft',
                  'transition-colors hover:border-primary/30 hover:bg-primary/5',
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-label-md">{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
