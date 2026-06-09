export function friendlyIdeasLoadError(err: unknown, hasLocalFallback: boolean): string {
  if (hasLocalFallback) {
    return 'לא הצלחנו להתחבר לענן — מוצגים נתונים שמורים מקומית. נסו לרענן מאוחר יותר.'
  }
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'בעיית חיבור לרשת. בדקו את האינטרנט ורעננו את הדף.'
  }
  return 'לא הצלחנו לטעון את הבקשות/רעיונות. נסו לרענן את הדף.'
}

export function friendlyIdeasEmptyCloudMessage(): string {
  return 'לא נמצאו בקשות/רעיונות. צרו בקשה/רעיון חדש או פנו למנהל המערכת.'
}

export function friendlySupabaseConfigMessage(): string {
  return 'המערכת פועלת במצב מקומי — חיבור לענן לא מוגדר.'
}
