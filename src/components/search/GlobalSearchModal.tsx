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
      className="lambo-search"
      role="dialog"
      aria-modal="true"
      aria-label="חיפוש גלובלי"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-container-max flex-col px-margin-mobile pt-24 md:px-margin-desktop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-center gap-3 border-b border-border-light pb-6">
          <Search className="h-6 w-6 shrink-0 text-secondary" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש בקשות/רעיונות, תיאורים, צ'אט…"
            className="flex-1 bg-transparent font-display text-headline-md text-on-surface outline-none placeholder:text-outline-variant"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="p-2 text-secondary transition-colors hover:text-on-surface"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-12">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
              מחפש…
            </div>
          )}

          {!loading && query.trim() && total === 0 && (
            <p className="py-16 text-center font-display text-headline-md text-secondary">
              לא נמצאו תוצאות
            </p>
          )}

          {!loading && results.ideas.length > 0 && (
            <section className="mb-8">
              <h3 className="section-eyebrow mb-4">בקשות/רעיונות</h3>
              <div className="lambo-stagger divide-y divide-border-light border border-border-light">
                {results.ideas.map(({ idea, snippet }) => (
                  <button
                    key={idea.id}
                    type="button"
                    className="flex w-full items-start gap-4 bg-surface-container-lowest px-4 py-4 text-right transition-colors hover:bg-surface-container"
                    onClick={() => {
                      navigate(ROUTES.ideaDetail(idea.id))
                      onClose()
                    }}
                  >
                    <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-label-md text-on-surface">{idea.title}</p>
                      <p className="mt-1 font-body-sm text-secondary">
                        #{idea.externalId} · {snippet}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!loading && results.chat.length > 0 && (
            <section>
              <h3 className="section-eyebrow mb-4">צ'אט</h3>
              <div className="divide-y divide-border-light border border-border-light">
                {results.chat.map(({ message, ideaTitle }) => (
                  <button
                    key={message.id}
                    type="button"
                    className="flex w-full items-start gap-4 bg-surface-container-lowest px-4 py-4 text-right transition-colors hover:bg-surface-container"
                    onClick={() => {
                      if (message.ideaId) navigate(ROUTES.ideaDetail(message.ideaId))
                      onClose()
                    }}
                  >
                    <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-secondary" />
                    <div>
                      <p className="font-label-md text-on-surface">
                        {ideaTitle ?? 'צ\'אט כללי'} · {message.authorName}
                      </p>
                      <p className={cn('mt-1 font-body-sm text-secondary line-clamp-2')}>
                        {message.body}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
