import { describe, expect, it } from 'vitest'
import { getIdeaOpenedAt, sortIdeas } from './ideaUtils'
import type { Idea } from '../types/idea'

function mockIdea(overrides: Partial<Idea>): Idea {
  return {
    id: 'if-abc',
    externalId: 'IF-1',
    title: 'Test',
    description: 'Desc',
    category: 'development',
    department: 'פיתוח',
    ideaSource: 'mitamim',
    priority: 'medium',
    workflowStatus: 'pending',
    createdAt: '2026-01-01',
    targetStartDate: '2026-01-15',
    sendToMaybeInbox: false,
    createdByUserId: 'nir',
    authorName: 'ניר',
    authorRole: 'מנהל',
    authorInitials: 'ניר',
    tags: [],
    goals: [],
    attachments: [],
    progress: 0,
    progressStep: '',
    ...overrides,
  }
}

describe('sortIdeas', () => {
  it('sorts by date descending (newest first)', () => {
    const ideas = [
      mockIdea({ id: 'if-1', createdAt: '2026-01-01' }),
      mockIdea({ id: 'if-zzzzzz', createdAt: '2026-06-01' }),
    ]
    const sorted = sortIdeas(ideas, 'date_desc')
    expect(sorted[0].id).toBe('if-zzzzzz')
  })

  it('sorts by priority high first', () => {
    const ideas = [
      mockIdea({ id: 'a', priority: 'low' }),
      mockIdea({ id: 'b', priority: 'high' }),
    ]
    const sorted = sortIdeas(ideas, 'priority_desc')
    expect(sorted[0].priority).toBe('high')
  })

  it('sorts by author name', () => {
    const ideas = [
      mockIdea({ id: 'a', authorName: 'תמר' }),
      mockIdea({ id: 'b', authorName: 'אבי' }),
    ]
    const sorted = sortIdeas(ideas, 'author_asc')
    expect(sorted[0].authorName).toBe('אבי')
  })
})

describe('getIdeaOpenedAt', () => {
  it('parses timestamp from if-* id', () => {
    const ts = Date.now()
    const id = `if-${ts.toString(36)}`
    expect(getIdeaOpenedAt(mockIdea({ id, createdAt: '2020-01-01' }))).toBe(ts)
  })
})
