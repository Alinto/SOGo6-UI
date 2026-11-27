'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useParams } from 'next/navigation'
import type { MailSearchParams } from '../mails-types'
import { setMailSearch } from '../store/mail-search-slice'
import { folderPathFromParams } from '../utils/folder-path-from-params'
import {
  ADVANCED_SEARCH_ROUTE_SEGMENT,
  mailSearchParamsToUrlSearchParams,
} from '../utils/mail-search-form'

/**
 * Active mail search of the current account (`null` without one), and how
 * the quick filters of the list change it.
 */
export function useActiveMailSearch(): {
  search: MailSearchParams | null
  /**
   * Replaces the active search by `next`. On the advanced search route the
   * URL is the search (see useSyncAdvancedSearchFromUrl), so its params are
   * updated in `urlParams`, to be pushed by the caller with its own changes;
   * elsewhere the search is set in the store.
   */
  replaceSearch: (urlParams: URLSearchParams, next: MailSearchParams) => void
} {
  const dispatch = useAppDispatch()
  const { account, folder } = useParams()
  const accountId = Array.isArray(account)
    ? (account[0] ?? '0')
    : (account ?? '0')
  const isAdvancedSearchRoute =
    folderPathFromParams(folder as string | string[] | undefined) ===
    ADVANCED_SEARCH_ROUTE_SEGMENT
  const mailSearch = useAppSelector((state) => state.mailSearch)
  const search =
    mailSearch.isActive && mailSearch.accountId === accountId
      ? mailSearch.params
      : null

  const replaceSearch = (
    urlParams: URLSearchParams,
    next: MailSearchParams
  ) => {
    if (!search) return
    if (isAdvancedSearchRoute) {
      // Changed params keep their place in the URL, removed ones go.
      const before = mailSearchParamsToUrlSearchParams(search)
      const after = mailSearchParamsToUrlSearchParams(next)
      before.forEach((_, key) => {
        const value = after.get(key)
        if (value === null) urlParams.delete(key)
        else urlParams.set(key, value)
      })
      after.forEach((value, key) => {
        if (!before.has(key)) urlParams.set(key, value)
      })
    } else {
      dispatch(
        setMailSearch({
          accountId,
          params: next,
          folder: mailSearch.folder ?? '',
        })
      )
    }
  }

  return { search, replaceSearch }
}
