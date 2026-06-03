const SALT = 'ideaflow-local-v1'

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:${SALT}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === passwordHash
}
