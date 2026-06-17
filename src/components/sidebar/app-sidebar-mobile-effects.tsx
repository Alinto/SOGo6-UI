'use client'

import { useCloseMobileSidebarOnNavigate } from '@/hooks/use-close-mobile-sidebar-on-navigate'

export function AppSidebarMobileEffects() {
  useCloseMobileSidebarOnNavigate()
  return null
}
