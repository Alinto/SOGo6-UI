'use client'

import { useSidebar } from '@/components/ui/sidebar'

/**
 * Whether the sidebar shows as an icon rail: collapsed on desktop. On mobile
 * the sidebar is a full-width sheet, whatever its collapsed state.
 */
export function useIsIconRail(): boolean {
  const { state, isMobile } = useSidebar()
  return state === 'collapsed' && !isMobile
}
