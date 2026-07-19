import { Navigate, Outlet } from 'react-router-dom'
import { ChatWidget } from '../chat/ChatWidget'
import { OfflineBanner } from '../ui/OfflineBanner'
import { useAppRoutes, useEmbedMode } from '../../context/EmbedModeContext'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const { isEmbed } = useEmbedMode()
  const routes = useAppRoutes()

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }

  return (
    <>
      <OfflineBanner />
      <Outlet />
      {!isEmbed && <ChatWidget />}
    </>
  )
}
