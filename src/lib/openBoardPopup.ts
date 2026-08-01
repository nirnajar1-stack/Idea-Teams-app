/** פתיחת לוח חיצוני בחלון קופץ גדול ממורכז */
export function openBoardPopup(url: string, title = 'לוח'): Window | null {
  if (typeof window === 'undefined') return null

  const width = Math.min(1320, Math.max(720, Math.floor(window.screen.availWidth * 0.9)))
  const height = Math.min(920, Math.max(560, Math.floor(window.screen.availHeight * 0.88)))
  const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0
  const dualScreenTop = window.screenTop ?? window.screenY ?? 0
  const left = Math.max(
    0,
    Math.floor(dualScreenLeft + (window.outerWidth - width) / 2),
  )
  const top = Math.max(
    0,
    Math.floor(dualScreenTop + (window.outerHeight - height) / 2),
  )

  const name = `ogen-board-${simpleHash(url)}`
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=yes',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
  ].join(',')

  const popup = window.open(url, name, features)
  if (!popup) return null

  try {
    popup.document.title = title
  } catch {
    // cross-origin — צפוי
  }
  popup.focus()
  return popup
}

function simpleHash(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}
