import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StoredUser } from '../../types/user'
import type { AppGroup } from '../../types/group'
import { cn } from '../../lib/cn'
import { matchesGroupSearch, matchesPeopleSearch } from '../../lib/peopleSearch'

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
  const [peopleQuery, setPeopleQuery] = useState('')
  const [groupQuery, setGroupQuery] = useState('')

  const options = useMemo(
    () => users.filter((u) => u.active && u.accessLevel !== 'guest'),
    [users],
  )
  const activeGroups = useMemo(() => groups.filter((g) => g.active), [groups])

  const filteredPeople = useMemo(
    () => options.filter((u) => matchesPeopleSearch(u, peopleQuery)),
    [options, peopleQuery],
  )
  const filteredGroups = useMemo(
    () => activeGroups.filter((g) => matchesGroupSearch(g, groupQuery)),
    [activeGroups, groupQuery],
  )

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
        <div className="relative mb-2">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
            aria-hidden
          />
          <input
            type="search"
            value={peopleQuery}
            onChange={(e) => setPeopleQuery(e.target.value)}
            disabled={disabled}
            placeholder="חיפוש אנשים…"
            aria-label="חיפוש אנשים"
            className="boutique-input h-10 bg-surface-container-low py-2 pr-10 text-sm"
          />
        </div>
        <div className="max-h-40 space-y-1 overflow-y-auto border border-border-light bg-surface-subtle p-2">
          {options.length === 0 ? (
            <p className="font-label-sm text-secondary">אין משתמשים זמינים</p>
          ) : filteredPeople.length === 0 ? (
            <p className="font-label-sm text-secondary">לא נמצאו אנשים התואמים לחיפוש</p>
          ) : (
            filteredPeople.map((u) => {
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
                    <span className="text-secondary">
                      ({u.jobTitle}
                      {u.username ? ` · @${u.username}` : ''})
                    </span>
                  </span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-label-md text-secondary">קבוצות מוקצות</label>
        <div className="relative mb-2">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
            aria-hidden
          />
          <input
            type="search"
            value={groupQuery}
            onChange={(e) => setGroupQuery(e.target.value)}
            disabled={disabled}
            placeholder="חיפוש קבוצות…"
            aria-label="חיפוש קבוצות"
            className="boutique-input h-10 bg-surface-container-low py-2 pr-10 text-sm"
          />
        </div>
        <div className="max-h-36 space-y-1 overflow-y-auto border border-border-light bg-surface-subtle p-2">
          {activeGroups.length === 0 ? (
            <p className="font-label-sm text-secondary">
              אין קבוצות — ניתן ליצור בניהול קבוצות
            </p>
          ) : filteredGroups.length === 0 ? (
            <p className="font-label-sm text-secondary">לא נמצאו קבוצות התואמות לחיפוש</p>
          ) : (
            filteredGroups.map((g) => {
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
