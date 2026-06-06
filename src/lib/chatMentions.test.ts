import { describe, expect, it } from 'vitest'
import { parseMentionedUserIds } from './chatMentions'
import type { StoredUser } from '../types/user'

const users: StoredUser[] = [
  {
    id: 'nir',
    name: 'ניר',
    jobTitle: 'מנהל',
    initials: 'נ',
    email: 'nir@test.io',
    username: 'nir',
    accessLevel: 'manager',
    active: true,
    passwordHash: '',
  },
  {
    id: 'golan',
    name: 'גולן',
    jobTitle: 'משתמש',
    initials: 'ג',
    email: 'golan@test.io',
    username: 'golan',
    accessLevel: 'member',
    active: true,
    passwordHash: '',
  },
]

describe('chatMentions', () => {
  it('parses @mention by name', () => {
    const ids = parseMentionedUserIds('שלום @ניר איך הולך?', users, 'golan')
    expect(ids).toContain('nir')
  })

  it('excludes self mentions', () => {
    const ids = parseMentionedUserIds('@גולן test', users, 'golan')
    expect(ids).not.toContain('golan')
  })
})
