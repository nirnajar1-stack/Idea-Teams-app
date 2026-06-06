import type { Idea } from './idea'
import type { ChatMessage } from './chat'

export interface SearchResultIdea {
  kind: 'idea'
  idea: Idea
  snippet: string
}

export interface SearchResultChat {
  kind: 'chat'
  message: ChatMessage
  ideaTitle?: string
}

export type SearchResult = SearchResultIdea | SearchResultChat

export interface GlobalSearchResults {
  ideas: SearchResultIdea[]
  chat: SearchResultChat[]
}
