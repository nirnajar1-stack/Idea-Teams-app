import { useEffect } from 'react'

interface UseKeyboardShortcutsOptions {
  onSearchOpen?: () => void
  onQuickAdd?: () => void
}

export function useKeyboardShortcuts({
  onSearchOpen,
  onQuickAdd,
}: UseKeyboardShortcutsOptions = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (isInput) return

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onSearchOpen?.()
        return
      }

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        onQuickAdd?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearchOpen, onQuickAdd])
}
