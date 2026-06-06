import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MessageSquare, Lightbulb, Loader2 } from 'lucide-react'
import { searchGlobal, searchIdeasLocal } from '../../api/searchApi'
import { ROUTES } from '../../constants/app'
import { useIdeas } from '../../context/IdeasContext'
import { isSupabaseEnabled } from '../../lib/supabaseClient'
import { cn } from '../../lib/cn'
import type { GlobalSearchResults } from '../../types/search'

export function GlobalSearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { visibleIdeas } = useIdeas()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GlobalSearchResults>({ ideas: [], chat: [] })

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim()
      if (!trimmed) {
        setResults({ ideas: [], chat: [] })
        return
      }
      setLoading(true)
      try {
        if (isSupabaseEnabled()) {
          setResults(await searchGlobal(trimmed))
        } else {
          setResults({ ideas: searchIdeasLocal(visibleIdeas, trimmed), chat: [] })
        }
      } catch {
        setResults({ ideas: searchIdeasLocal(visibleIdeas, trimmed), chat: [] })
      } finally {
        setLoading(false)
      }
    },
    [visibleIdeas],
  )

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => void runSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, open, runSearch])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const total = results.ideas.length + results.chat.length

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="חיפוש גלובלי"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-light bg-surface-container-lowest shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border-light px-4 py-3">
          <Search className="h-5 w-5 text-secondary" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש רעיונות, תיאורים, צ'אט…"
            className="flex-1 bg-transparent font-body-md outline-none"
          />
          <button type="button" onClick={onClose} aria-label="סגירה" className="rounded-lg p-1 hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
              מחפש…
            </div>
          )}

          {!loading && query.trim() && total === 0 && (
            <p className="py-8 text-center font-body-md text-secondary">לא נמצאו תוצאות</p>
          )}

          {!loading && results.ideas.length > 0 && (
            <section className="mb-2">
              <h3 className="px-3 py-2 font-label-sm uppercase text-secondary">רעיונות</h3>
              {results.ideas.map(({ idea, snippet }) => (
                <button
                  key={idea.id}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-right hover:bg-surface-container-low"
                  onClick={() => {
                    navigate(ROUTES.ideaDetail(idea.id))
                    onClose()
                  }}
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-label-md text-on-surface">{idea.title}</p>
                    <p className="font-label-sm text-secondary">#{idea.externalId} · {snippet}</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!loading && results.chat.length > 0 && (
            <section>
              <h3 className="px-3 py-2 font-label-sm uppercase text-secondary">צ'אט</h3>
              {results.chat.map(({ message, ideaTitle }) => (
                <button
                  key={message.id}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-right hover:bg-surface-container-low"
                  onClick={() => {
                    if (message.ideaId) navigate(ROUTES.ideaDetail(message.ideaId))
                    onClose()
                  }}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-label-md text-on-surface">
                      {ideaTitle ?? 'צ\'אט כללי'} · {message.authorName}
                    </p>
                    <p className={cn('font-label-sm text-secondary line-clamp-2')}>{message.body}</p>
                  </div>
                </button>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
