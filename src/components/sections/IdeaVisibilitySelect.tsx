import type { IdeaVisibility } from '../../types/idea'
import type { AppUser } from '../../types/user'
import {
  IDEA_VISIBILITY_HINTS,
  IDEA_VISIBILITY_LABELS,
  visibilityOptionsForUser,
} from '../../lib/ideaVisibility'

export function IdeaVisibilitySelect({
  user,
  value,
  disabled,
  onChange,
}: {
  user: AppUser
  value: IdeaVisibility
  disabled?: boolean
  onChange: (v: IdeaVisibility) => void
}) {
  const options = visibilityOptionsForUser(user)
  if (options.length <= 1 && options[0] === 'team') return null

  return (
    <div>
      <label className="mb-2 block font-label-md text-secondary">מי יראה את הבקשה/רעיון?</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as IdeaVisibility)}
        className="boutique-input w-full"
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {IDEA_VISIBILITY_LABELS[v]}
          </option>
        ))}
      </select>
      <p className="mt-2 font-label-sm text-secondary">{IDEA_VISIBILITY_HINTS[value]}</p>
    </div>
  )
}
