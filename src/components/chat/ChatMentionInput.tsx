import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUsers } from '../../context/UsersContext'
import {
  filterMentionCandidates,
  getMentionCaretState,
  mentionInsertToken,
} from '../../lib/chatMentions'
import { cn } from '../../lib/cn'

export interface ChatMentionInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  enableMentions?: boolean
  className?: string
}

export function ChatMentionInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  enableMentions = false,
  className,
}: ChatMentionInputProps) {
  const { user } = useAuth()
  const { users } = useUsers()
  const inputRef = useRef<HTMLInputElement>(null)
  const [caret, setCaret] = useState(0)
  const [highlight, setHighlight] = useState(0)

  const mentionState = useMemo(() => {
    if (!enableMentions || !user) return null
    return getMentionCaretState(value, caret)
  }, [enableMentions, user, value, caret])

  const candidates = useMemo(() => {
    if (!mentionState || !user) return []
    return filterMentionCandidates(users, user.id, mentionState.query)
  }, [mentionState, users, user])

  const showSuggestions = enableMentions && mentionState !== null && candidates.length > 0

  const syncCaret = useCallback(() => {
    const el = inputRef.current
    if (el) setCaret(el.selectionStart ?? value.length)
  }, [value.length])

  const applyMention = useCallback(
    (userId: string) => {
      const picked = users.find((u) => u.id === userId)
      if (!picked || !mentionState) return

      const before = value.slice(0, mentionState.startIndex)
      const after = value.slice(caret)
      const next = `${before}${mentionInsertToken(picked)}${after}`
      onChange(next)

      const newCaret = before.length + mentionInsertToken(picked).length
      requestAnimationFrame(() => {
        const el = inputRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(newCaret, newCaret)
          setCaret(newCaret)
        }
      })
      setHighlight(0)
    },
    [users, mentionState, value, caret, onChange],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => (h + 1) % candidates.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => (h - 1 + candidates.length) % candidates.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const pick = candidates[highlight] ?? candidates[0]
        if (pick) applyMention(pick.id)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setHighlight(0)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      {showSuggestions && (
        <ul
          className="absolute bottom-full z-20 mb-2 max-h-48 w-full overflow-y-auto border border-border-light bg-surface-container-lowest py-1"
          role="listbox"
          aria-label="תיוג משתמשים"
        >
          {candidates.map((u, i) => (
            <li key={u.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-right transition-colors',
                  i === highlight ? 'bg-primary/15 text-primary' : 'hover:bg-primary/10',
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  applyMention(u.id)
                }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-label-sm text-primary">
                  {u.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-label-md text-on-surface">{u.name}</span>
                  <span className="block font-label-sm text-secondary">@{u.username}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        maxLength={4000}
        placeholder={placeholder}
        className="boutique-input h-11 w-full py-2"
        onChange={(e) => {
          onChange(e.target.value)
          setCaret(e.target.selectionStart ?? e.target.value.length)
        }}
        onClick={syncCaret}
        onKeyUp={syncCaret}
        onKeyDown={handleKeyDown}
        onSelect={syncCaret}
        onFocus={syncCaret}
      />
    </div>
  )
}
