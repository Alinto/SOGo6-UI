'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { getMailListLabels } from '../utils/client-mail-list-filter'

/** Labels of the mail list label quick filter, read from the URL. */
export function useMailListLabels(): string[] {
  const searchParams = useSearchParams()
  const key = getMailListLabels(searchParams).join('\n')
  return useMemo(() => (key ? key.split('\n') : []), [key])
}
