import { CHECK_CADENCE_LABELS } from '../../lib/ideaUtils'
import { IDEA_CHECK_CADENCES, type IdeaCheckCadence } from '../../types/idea'

interface CheckCadenceSelectProps {
  value: IdeaCheckCadence | null | undefined
  disabled?: boolean
  onChange: (cadence: IdeaCheckCadence | null) => void
}

export function CheckCadenceSelect({
  value,
  disabled = false,
  onChange,
}: CheckCadenceSelectProps) {
  return (
    <div>
      <label className="mb-2 block font-label-md text-on-surface">בדיקה שוטפת</label>
      <p className="mb-3 font-label-sm text-secondary">
        משימות קטנות ללא יום קבוע — יופיעו בטיימליין תחת בדיקות שוטפות.
      </p>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value as IdeaCheckCadence | ''
          onChange(next ? next : null)
        }}
        className="boutique-input h-12 w-full"
      >
        <option value="">ללא — תכנון לפי יום בלוח</option>
        {IDEA_CHECK_CADENCES.map((cadence) => (
          <option key={cadence} value={cadence}>
            {CHECK_CADENCE_LABELS[cadence]}
          </option>
        ))}
      </select>
    </div>
  )
}
