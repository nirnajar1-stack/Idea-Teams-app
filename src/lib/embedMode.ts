export function isEmbedPathname(pathname: string): boolean {
  return pathname === '/embed' || pathname.startsWith('/embed/')
}

export function isEmbedSearch(search: string): boolean {
  return new URLSearchParams(search).get('embed') === '1'
}

export function isEmbedMode(pathname: string, search: string): boolean {
  return isEmbedPathname(pathname) || isEmbedSearch(search)
}

/** מבקש גישה ל-storage בתוך iframe (Chrome / Safari) */
export async function requestEmbedStorageAccess(): Promise<void> {
  try {
    if (typeof document.requestStorageAccess === 'function') {
      await document.requestStorageAccess()
    }
  } catch {
    // דפדפן דחה או אין צורך — ממשיכים בלי
  }
}
