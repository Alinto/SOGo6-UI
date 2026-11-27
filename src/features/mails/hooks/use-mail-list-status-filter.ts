'use client'

import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { toMailListApiFilter } from '../utils/client-mail-list-filter'
import {
  hasStatusFilters,
  searchToStatusFilter,
  toMatchAll,
  withoutStatusFilters,
} from '../utils/quick-filter-search'
import { useActiveMailSearch } from './use-active-mail-search'

/**
 * Status quick filter of the mail list (all, read, unread, important,
 * attachments), shared by the filter buttons and the compact dropdown.
 *
 * `value` is the URL `filter=` or, without one, the status asked for by the
 * active `match:all` search (`is:read subject:invoice` selects "Read").
 * `setValue` replaces the status of the search: its own status criteria are
 * removed, then the chosen one is set in the URL (none for "all"). Choosing
 * a status during a `match:any` search turns it into a `match:all` one.
 */
export function useMailListStatusFilter(): {
  value: string
  setValue: (value: string) => void
} {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const { search, replaceSearch } = useActiveMailSearch()

  const value =
    toMailListApiFilter(searchParams.get('filter')) ??
    (search ? searchToStatusFilter(search) : undefined) ??
    'all'

  const setValue = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const isStatus = Boolean(next) && next !== 'all'
    if (search) {
      // A chosen status turns a match:any search into a match:all one for
      // good; "all" only removes the status.
      let nextSearch = hasStatusFilters(search)
        ? withoutStatusFilters(search)
        : search
      if (isStatus) nextSearch = toMatchAll(nextSearch)
      if (nextSearch !== search) replaceSearch(params, nextSearch)
    }
    if (!next || next === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', next)
    }
    params.delete('page')
    const query = params.toString()
    push(query ? `${pathname}?${query}` : pathname)
  }

  return { value, setValue }
}
