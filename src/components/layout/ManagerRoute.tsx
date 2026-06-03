import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { canManageUsers } from '../../lib/permissions'

export function ManagerRoute() {
  const { user } = useAuth()

  if (!canManageUsers(user)) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
