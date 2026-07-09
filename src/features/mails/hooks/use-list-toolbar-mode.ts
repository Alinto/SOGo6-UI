'use client'

import { useGetPreferencesQuery } from '@/features/app-data/store/user-preferences-api'
import { useMailDetailNavigation } from '@/features/mails/hooks/use-mail-detail-navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'

export type ListToolbarMode = 'list' | 'detail-navigation' | 'hidden'

/**
 * Determines which toolbar variant to show in the mail folder layout.
 * - `list`: full list controls (filters, pagination, selection)
 * - `detail-navigation`: minimal prev/next bar (mobile full-screen reading)
 * - `hidden`: no layout toolbar (desktop full-screen reading; mail page has its own chrome)
 */
export function useListToolbarMode(): ListToolbarMode {
  const isMobile = useIsMobile()
  const { isOnMailDetailPath } = useMailDetailNavigation()
  const mailLayoutMode = useAppSelector(
    (state: RootState) => state.mailLayout.mode
  )
  const { data } = useGetPreferencesQuery()
  const layoutType = data?.layoutType || 'modern'

  const isSplitMode = mailLayoutMode === 'split' && !isMobile
  const isClassicLayout = layoutType === 'classic' || isSplitMode
  const listPaneVisible = isClassicLayout

  if (!isOnMailDetailPath || listPaneVisible) {
    return 'list'
  }

  if (isMobile) {
    return 'detail-navigation'
  }

  return 'hidden'
}
