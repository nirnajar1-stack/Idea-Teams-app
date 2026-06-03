import type { LucideIcon } from 'lucide-react'

export type AppRouteId = 'dashboard' | 'ideas' | 'add' | 'profile'

export interface NavLinkItem {
  id: AppRouteId | 'community'
  label: string
  to: string
}

export interface BottomNavItem {
  id: AppRouteId
  label: string
  to: string
  icon: LucideIcon
}
