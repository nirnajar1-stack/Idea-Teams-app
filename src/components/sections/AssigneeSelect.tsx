import type { StoredUser } from '../../types/user'

export function AssigneeSelect({
  users,
  value,
  disabled,
  onChange,
}: {
  users: StoredUser[]
  value?: string
  disabled?: boolean
  onChange: (userId: string | undefined) => void
}) {
  const options = users.filter(
    (u) => u.active && u.accessLevel !== 'guest',
  )

  return (
    <div>
      <label className="mb-2 block font-label-md text-secondary">משתמש מוקצה</label>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="boutique-input w-full rounded-xl"
      >
        <option value="">ללא הקצאה</option>
        {options.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.jobTitle})
          </option>
        ))}
      </select>
    </div>
  )
}
