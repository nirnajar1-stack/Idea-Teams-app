import { ExternalLink, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState } from '../components/ui/EmptyState'
import { useLinkedBoards } from '../context/LinkedBoardsContext'
import { ROUTES } from '../constants/app'
import { LINKED_BOARD_PROVIDER_LABELS } from '../types/linkedBoard'

export function LinkedBoardsPage() {
  const { boards, canManage, isReady } = useLinkedBoards()

  return (
    <AppShell variant="main">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
        <div className="text-right">
          <span className="section-eyebrow">גישה מהירה</span>
          <h1 className="font-display text-headline-lg text-on-surface">לוחות מקושרים</h1>
          <p className="mt-1 text-body-sm text-secondary">
            Notion, Power BI ואתרים חיצוניים — פתיחה מתוך האפליקציה.
          </p>
        </div>
        {canManage && (
          <Link to={ROUTES.boardsManage} className="btn-secondary-light min-h-11">
            ניהול לוחות
          </Link>
        )}
      </div>

      {!isReady ? (
        <p className="text-secondary">טוען…</p>
      ) : boards.length === 0 ? (
        <EmptyState
          title="אין לוחות מקושרים"
          description={
            canManage
              ? 'הוסיפו קישור ללוח Notion או דוח חיצוני.'
              : 'כשיוגדר לוח על ידי מאסטר — הוא יופיע כאן.'
          }
          action={
            canManage ? (
              <Link to={ROUTES.boardsManage} className="btn-boutique">
                הוסף לוח
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={ROUTES.boardDetail(board.id)}
              className="glass-card-hover flex flex-col gap-3 p-4 text-right"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-label-md text-on-surface">{board.title}</h2>
                  <p className="mt-0.5 text-label-sm text-secondary">
                    {LINKED_BOARD_PROVIDER_LABELS[board.provider]}
                    {board.viewMode === 'link' ? ' · נפתח בטאב' : ' · מוטמע'}
                  </p>
                </div>
                {board.viewMode === 'link' && (
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                )}
              </div>
              {board.description && (
                <p className="line-clamp-2 text-body-sm text-secondary">{board.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
