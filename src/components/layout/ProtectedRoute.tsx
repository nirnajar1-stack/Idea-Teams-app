import { Navigate, Outlet } from 'react-router-dom'
import { ChatWidget } from '../chat/ChatWidget'
import { OfflineBanner } from '../ui/OfflineBanner'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  return (
    <>
      <OfflineBanner />
      <Outlet />
      <ChatWidget />
    </>
  )
}
