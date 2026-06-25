'use client'

import { useProfile } from '@/features/user-profile'
import { useMemo } from 'react'
import { resolveContactSearchMinLength } from '../utils/contact-search-min-length'

export function useContactSearchMinLength(): number {
  const { uiSettings } = useProfile()

  return useMemo(
    () =>
      resolveContactSearchMinLength(uiSettings?.SOGO_D_AUTOCOMPLETION_MIN_LEN),
    [uiSettings?.SOGO_D_AUTOCOMPLETION_MIN_LEN]
  )
}
