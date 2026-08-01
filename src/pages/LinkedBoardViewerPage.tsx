import { ArrowRight, AppWindow, ExternalLink, LayoutGrid } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { useLinkedBoards } from '../context/LinkedBoardsContext'
import { ROUTES } from '../constants/app'
import { openBoardPopup } from '../lib/openBoardPopup'
import {
  LINKED_BOARD_PROVIDER_LABELS,
  providerBlocksIframe,
  resolveViewMode,
} from '../types/linkedBoard'

export function LinkedBoardViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { getBoardById, isReady } = useLinkedBoards()
  const board = id ? getBoardById(id) : undefined
  const [popupBlocked, setPopupBlocked] = useState(false)

  const effectiveMode = useMemo(() => {
    if (!board) return 'popup' as const
    return resolveViewMode(board.provider, board.viewMode)
  }, [board])

  const handleOpenPopup = useCallback(() => {
    if (!board) return
    const win = openBoardPopup(board.url, board.title)
    if (!win) {
      setPopupBlocked(true)
      toast.error('הדפדפן חסם חלון קופץ — אשרו חלונות קופצים או פתחו בטאב')
      return
    }
    setPopupBlocked(false)
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

  const blocksIframe = providerBlocksIframe(board.provider)
  const showIframe = effectiveMode === 'iframe' && !blocksIframe
  const usePopup = effectiveMode === 'popup' || (blocksIframe && effectiveMode !== 'link')

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
        <div className="flex flex-wrap items-center gap-2">
          {(usePopup || !showIframe) && (
            <button
              type="button"
              onClick={handleOpenPopup}
              className="btn-boutique inline-flex min-h-11 items-center gap-2"
            >
              <AppWindow className="h-4 w-4" aria-hidden />
              פתח בחלון קופץ
            </button>
          )}
          <a
            href={board.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-light inline-flex min-h-11 items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            טאב חדש
          </a>
        </div>
      </div>

      {showIframe ? (
        <div className="overflow-hidden rounded-[1.35rem] border border-border-light bg-surface-container-lowest shadow-soft">
          <iframe
            title={board.title}
            src={board.url}
            className="h-[min(75vh,720px)] w-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="border-t border-border-light px-4 py-2 text-center text-micro text-secondary">
            אם הלוח לא נטען — האתר חוסם הטמעה. השתמשו ב«פתח בחלון קופץ».
          </p>
        </div>
      ) : (
        <div className="rounded-[1.35rem] bg-surface-container-lowest px-5 py-10 text-center shadow-soft">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutGrid className="h-7 w-7" aria-hidden />
          </span>
          <p className="font-display text-headline-md text-on-surface">{board.title}</p>
          <p className="mx-auto mt-3 max-w-md text-body-sm leading-relaxed text-secondary">
            {board.provider === 'notion'
              ? 'Notion לא ניתן להטמיע בתוך הדף. פתחו בחלון קופץ גדול — זה הכי קרוב לתצוגה בתוך האפליקציה.'
              : 'פתחו את הלוח בחלון קופץ או בטאב חדש.'}
          </p>
          {board.description && (
            <p className="mt-2 text-body-sm text-secondary">{board.description}</p>
          )}
          {popupBlocked && (
            <p className="mt-3 text-body-sm text-error">
              החלון נחסם על ידי הדפדפן. אשרו חלונות קופצים לאתר זה, או השתמשו ב«טאב חדש».
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOpenPopup}
              className="btn-boutique inline-flex min-h-12 items-center gap-2 px-6"
            >
              <AppWindow className="h-4 w-4" aria-hidden />
              פתח בחלון קופץ
            </button>
            <a
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-light inline-flex min-h-12 items-center gap-2 px-5"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              טאב חדש
            </a>
          </div>
        </div>
      )}
    </AppShell>
  )
}
