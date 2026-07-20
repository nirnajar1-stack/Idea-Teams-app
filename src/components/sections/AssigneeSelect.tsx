import type { StoredUser } from '../../types/user'
import type { AppGroup } from '../../types/group'
import { cn } from '../../lib/cn'

export function AssigneeSelect({
  users,
  groups,
  userIds,
  groupIds,
  disabled,
  onChange,
}: {
  users: StoredUser[]
  groups: AppGroup[]
  userIds: string[]
  groupIds: string[]
  disabled?: boolean
  onChange: (next: { userIds: string[]; groupIds: string[] }) => void
}) {
  const options = users.filter((u) => u.active && u.accessLevel !== 'guest')
  const activeGroups = groups.filter((g) => g.active)

  const toggleUser = (id: string) => {
    const set = new Set(userIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({ userIds: Array.from(set), groupIds })
  }

  const toggleGroup = (id: string) => {
    const set = new Set(groupIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({ userIds, groupIds: Array.from(set) })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block font-label-md text-secondary">משתמשים מוקצים</label>
        <div className="max-h-40 space-y-1 overflow-y-auto border border-border-light bg-surface-subtle p-2">
          {options.length === 0 ? (
            <p className="font-label-sm text-secondary">אין משתמשים זמינים</p>
          ) : (
            options.map((u) => {
              const checked = userIds.includes(u.id)
              return (
                <label
                  key={u.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 font-label-sm transition-colors',
                    checked ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low',
                    disabled && 'pointer-events-none opacity-60',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleUser(u.id)}
                    className="accent-primary"
                  />
                  <span>
                    {u.name}{' '}
                    <span className="text-secondary">({u.jobTitle})</span>
                  </span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-label-md text-secondary">קבוצות מוקצות</label>
        <div className="max-h-36 space-y-1 overflow-y-auto border border-border-light bg-surface-subtle p-2">
          {activeGroups.length === 0 ? (
            <p className="font-label-sm text-secondary">
              אין קבוצות — ניתן ליצור בניהול קבוצות
            </p>
          ) : (
            activeGroups.map((g) => {
              const checked = groupIds.includes(g.id)
              return (
                <label
                  key={g.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 font-label-sm transition-colors',
                    checked ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low',
                    disabled && 'pointer-events-none opacity-60',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleGroup(g.id)}
                    className="accent-primary"
                  />
                  <span>
                    {g.name}{' '}
                    <span className="text-secondary">({g.memberIds.length} חברים)</span>
                  </span>
                </label>
              )
            })
          )}
        </div>
      </div>

      {(userIds.length > 0 || groupIds.length > 0) && (
        <p className="font-label-sm text-secondary">
          נבחרו {userIds.length} משתמשים, {groupIds.length} קבוצות
        </p>
      )}
    </div>
  )
}
