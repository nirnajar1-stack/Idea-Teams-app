import { describe, expect, it } from 'vitest'
import { matchesGroupSearch, matchesPeopleSearch } from './peopleSearch'

describe('matchesPeopleSearch', () => {
  const nir = { name: 'ניר', username: 'nir', jobTitle: 'מנהל מוצר' }

  it('matches empty query', () => {
    expect(matchesPeopleSearch(nir, '')).toBe(true)
    expect(matchesPeopleSearch(nir, '   ')).toBe(true)
  })

  it('matches name, username, and job title', () => {
    expect(matchesPeopleSearch(nir, 'ניר')).toBe(true)
    expect(matchesPeopleSearch(nir, 'NIR')).toBe(true)
    expect(matchesPeopleSearch(nir, 'מוצר')).toBe(true)
  })

  it('rejects non-matches', () => {
    expect(matchesPeopleSearch(nir, 'גולן')).toBe(false)
  })
})

describe('matchesGroupSearch', () => {
  it('filters by group name', () => {
    expect(matchesGroupSearch({ name: 'צוות פיתוח' }, 'פיתוח')).toBe(true)
    expect(matchesGroupSearch({ name: 'צוות פיתוח' }, 'שיווק')).toBe(false)
  })
})
