import { ArrowRight, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useLinkedBoards } from '../context/LinkedBoardsContext'
import { ROUTES } from '../constants/app'
import { LINKED_BOARD_PROVIDER_LABELS } from '../types/linkedBoard'

export function LinkedBoardViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { getBoardById, isReady } = useLinkedBoards()
  const board = id ? getBoardById(id) : undefined
  const [iframeFailed, setIframeFailed] = useState(false)

  useEffect(() => {
    setIframeFailed(false)
  }, [id])

  useEffect(() => {
    if (!board || board.viewMode !== 'link') return
    window.open(board.url, '_blank', 'noopener,noreferrer')
  }, [board])

  if (!isReady) {
    return (
      <AppShell variant="back">
        <p className="text-secondary">טוען…</p>
      </AppShell>
    )
  }

  if (!board) {
    return <Navigate to={ROUTES.boards} replace />
  }

  const showIframe = board.viewMode === 'iframe' && !iframeFailed

  return (
    <AppShell variant="back" maxWidth="full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-right">
          <Link
            to={ROUTES.boards}
            className="mb-1 inline-flex items-center gap-1 text-label-sm text-secondary hover:text-on-surface"
          >
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            לוחות
          </Link>
          <h1 className="truncate font-display text-headline-md text-on-surface">
            {board.title}
          </h1>
          <p className="text-label-sm text-secondary">
            {LINKED_BOARD_PROVIDER_LABELS[board.provider]}
          </p>
        </div>
        <a
          href={board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-boutique inline-flex min-h-11 items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          פתח באתר המקורי
        </a>
      </div>

      {showIframe ? (
        <div className="overflow-hidden rounded-[1.35rem] border border-border-light bg-surface-container-lowest shadow-soft">
          <iframe
            title={board.title}
            src={board.url}
            className="h-[min(75vh,720px)] w-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setIframeFailed(true)}
          />
          <p className="border-t border-border-light px-4 py-2 text-center text-micro text-secondary">
            אם הלוח לא נטען — האתר חוסם הטמעה. השתמשו ב«פתח באתר המקורי».
          </p>
        </div>
      ) : (
        <div className="rounded-[1.35rem] bg-surface-container-lowest px-5 py-8 text-center shadow-soft">
          <p className="font-body-md text-on-surface">
            {board.viewMode === 'link'
              ? 'הלוח נפתח בטאב חדש (אתרים כמו Notion לרוב חוסמים הטמעה).'
              : 'לא ניתן להציג את הלוח בתוך האפליקציה.'}
          </p>
          {board.description && (
            <p className="mt-2 text-body-sm text-secondary">{board.description}</p>
          )}
          <a
            href={board.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-boutique mt-5 inline-flex min-h-11 items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            פתח שוב
          </a>
        </div>
      )}
    </AppShell>
  )
}
