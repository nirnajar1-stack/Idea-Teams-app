/** Normalizes a people/group search query for case-insensitive substring match. */
export function normalizePeopleSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

/** Match active directory users by display name and username (and optional job title). */
export function matchesPeopleSearch(
  person: { name: string; username?: string; jobTitle?: string },
  query: string,
): boolean {
  const q = normalizePeopleSearchQuery(query)
  if (!q) return true
  if (person.name.toLowerCase().includes(q)) return true
  if (person.username?.toLowerCase().includes(q)) return true
  if (person.jobTitle?.toLowerCase().includes(q)) return true
  return false
}

export function matchesGroupSearch(group: { name: string }, query: string): boolean {
  const q = normalizePeopleSearchQuery(query)
  if (!q) return true
  return group.name.toLowerCase().includes(q)
}
