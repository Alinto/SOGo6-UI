'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { setMailSearch } from '../store/mail-search-slice'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import {
  ADVANCED_SEARCH_ROUTE_SEGMENT,
  urlSearchParamsToMailSearchParams,
} from '../utils/mail-search-form'

/**
 * The advanced search route (`/u/{account}/advanced-search?...`) is
 * URL-driven so it's bookmarkable/shareable and survives a reload — this
 * hydrates that URL into the active `mailSearch` (the source of truth the
 * rest of the mail UI reads) whenever it's opened directly, reloaded, or
 * reached via browser back/forward.
 */
export function useSyncAdvancedSearchFromUrl() {
  const dispatch = useAppDispatch()
  const { account, folder } = useParams()
  const accountId = Array.isArray(account)
    ? (account[0] ?? '0')
    : (account ?? '0')
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const isAdvancedSearchRoute = folderPath === ADVANCED_SEARCH_ROUTE_SEGMENT
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const mailSearch = useAppSelector((state) => state.mailSearch)

  useEffect(() => {
    if (!isAdvancedSearchRoute) return
    const params = urlSearchParamsToMailSearchParams(
      new URLSearchParams(queryString)
    )
    const alreadySynced =
      mailSearch.isActive &&
      mailSearch.accountId === accountId &&
      mailSearch.folder === ADVANCED_SEARCH_ROUTE_SEGMENT &&
      JSON.stringify(mailSearch.params) === JSON.stringify(params)
    if (alreadySynced) return
    dispatch(
      setMailSearch({
        accountId,
        params,
        folder: ADVANCED_SEARCH_ROUTE_SEGMENT,
      })
    )
    // Re-syncs only on what actually identifies the search (route + query
    // string); `mailSearch.*` is read purely to decide whether a dispatch is
    // needed and must not itself retrigger this effect (that dispatch would
    // otherwise loop back into its own dependency).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchRoute, accountId, queryString, dispatch])
}
