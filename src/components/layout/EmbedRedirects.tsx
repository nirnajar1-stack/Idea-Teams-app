import { Navigate } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'

export function DefaultHomeRedirect() {
  const routes = useAppRoutes()
  return <Navigate to={routes.home} replace />
}

export function PublicLoginRedirect() {
  const routes = useAppRoutes()
  return <Navigate to={routes.login} replace />
}
