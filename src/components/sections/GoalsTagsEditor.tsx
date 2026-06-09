import { Plus, Tag, Target, X } from 'lucide-react'
import { useState } from 'react'
import { Input } from '../ui/Input'

export interface GoalsTagsEditorProps {
  goals: string[]
  tags: string[]
  disabled?: boolean
  onChange: (patch: { goals?: string[]; tags?: string[] }) => void
}

export function GoalsTagsEditor({
  goals,
  tags,
  disabled = false,
  onChange,
}: GoalsTagsEditorProps) {
  const [newGoal, setNewGoal] = useState('')
  const [newTag, setNewTag] = useState('')

  const addGoal = () => {
    const trimmed = newGoal.trim()
    if (!trimmed || goals.includes(trimmed)) return
    onChange({ goals: [...goals, trimmed] })
    setNewGoal('')
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange({ tags: [...tags, trimmed] })
    setNewTag('')
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          <h4 className="font-label-md text-on-surface">יעדים</h4>
        </div>
        <ul className="mb-3 space-y-2">
          {goals.map((goal) => (
            <li
              key={goal}
              className="flex items-center justify-between gap-2 border border-border-light bg-surface-subtle px-3 py-2 font-body-md text-on-surface-variant"
            >
              <span>{goal}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ goals: goals.filter((g) => g !== goal) })}
                  className="p-1 text-secondary hover:text-error"
                  aria-label="הסר יעד"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
          {goals.length === 0 && (
            <li className="font-body-md text-secondary">טרם הוגדרו יעדים</li>
          )}
        </ul>
        {!disabled && (
          <div className="flex gap-2">
            <Input
              label="יעד חדש"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="יעד חדש..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
            />
            <button
              type="button"
              onClick={addGoal}
              className="shrink-0 border border-primary/20 bg-primary/5 px-3 text-primary hover:bg-primary/10"
              aria-label="הוסף יעד"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Tag className="h-5 w-5" />
          <h4 className="font-label-md text-on-surface">תגים</h4>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border-light bg-surface-container-low/80 px-3 py-1 text-[13px] text-on-surface-variant"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ tags: tags.filter((t) => t !== tag) })}
                  className="p-0.5 hover:text-error"
                  aria-label="הסר תג"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {tags.length === 0 && (
            <span className="font-body-md text-secondary">אין תגים</span>
          )}
        </div>
        {!disabled && (
          <div className="flex gap-2">
            <Input
              label="תג חדש"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="תג חדש..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="shrink-0 border border-primary/20 bg-primary/5 px-3 text-primary hover:bg-primary/10"
              aria-label="הוסף תג"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
