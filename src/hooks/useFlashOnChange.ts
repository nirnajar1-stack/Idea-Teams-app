import { useEffect, useRef, useState } from 'react'

/**
 * Returns a CSS class briefly after `value` changes (skips first mount).
 * Respects prefers-reduced-motion via the animation CSS itself.
 */
export function useFlashOnChange(value: unknown, durationMs = 480): string {
  const prev = useRef(value)
  const mounted = useRef(false)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      prev.current = value
      return
    }
    if (Object.is(prev.current, value)) return
    prev.current = value
    setFlashing(true)
    const t = window.setTimeout(() => setFlashing(false), durationMs)
    return () => window.clearTimeout(t)
  }, [value, durationMs])

  return flashing ? 'animate-status-flash' : ''
}
