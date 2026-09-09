'use client'

import {
  selectSkipFolderFetch,
  setMailNavigation,
} from '@/features/mails/store/mail-navigation-slice'
import { clearMailSearch } from '@/features/mails/store/mail-search-slice'
import {
  useGetFolderMessagesQuery,
  useSearchMailsQuery,
} from '@/features/mails/store/mails-api'
import { usePathname } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { isMailDetailPath } from '../utils/mail-detail-navigation'
import { ADVANCED_SEARCH_ROUTE_SEGMENT } from '../utils/mail-search-form'
import { useCurrentFolder } from './use-current-folder'

const EXCLUDED_PARAMS = ['filter']

const MAIL_LIST_DEFAULTS: Record<string, string> = {
  fields: 'contents',
  fields_action: 'exclude',
  page_size: '20',
}

const SORT_PARAM_MAP: Record<string, { sort_by: string; sort_order: string }> =
  {
    t_asc: { sort_by: 'date', sort_order: 'desc' },
    t_desc: { sort_by: 'date', sort_order: 'asc' },
    s_asc: { sort_by: 'size', sort_order: 'asc' },
    s_desc: { sort_by: 'size', sort_order: 'desc' },
  }

interface UseFolderMessagesOptions {
  folder: string
  accountId?: string
}

export function useFolderMessages({
  folder,
  accountId,
}: UseFolderMessagesOptions) {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const skipFolderFetch = useAppSelector(selectSkipFolderFetch)
  const mailSearch = useAppSelector((state) => state.mailSearch)
  const {
    isSelectable,
    isVirtual,
    isLoading: isFolderLoading,
  } = useCurrentFolder(folder, accountId)

  const resolvedAccountId = accountId ?? '0'
  const isSearchActive =
    mailSearch.isActive && mailSearch.accountId === resolvedAccountId
  // The advanced-search route is a pseudo-folder: it never corresponds to a
  // real IMAP folder, and its `mailSearch` state is driven by the URL itself
  // (see useSyncAdvancedSearchFromUrl) rather than by user interaction.
  const isAdvancedSearchRoute = folder === ADVANCED_SEARCH_ROUTE_SEGMENT

  // Navigating to a different folder or account while a search is active
  // leaves the results view; clear it so the newly opened folder/account
  // shows its own mails. This is tracked against `mailSearch.folder`/
  // `accountId` (Redux) rather than a local ref: this hook is called from
  // page-level components, which Next.js remounts on every navigation, so a
  // component-local "previous folder" would always initialize to the new
  // folder and never see it change.
  //
  // This checks `mailSearch.isActive` directly rather than `isSearchActive`
  // (which already requires `mailSearch.accountId === resolvedAccountId`) so
  // that switching to a different account also clears the search — otherwise
  // it stays dormant in Redux and silently reappears when the user switches
  // back to the original account/folder.
  useEffect(() => {
    if (!mailSearch.isActive || isAdvancedSearchRoute) return
    const accountChanged = mailSearch.accountId !== resolvedAccountId
    const folderChanged =
      mailSearch.folder != null && mailSearch.folder !== folder
    // Opening a cross-folder search result changes the route's folder to
    // that mail's own real folder (see list-item-*.tsx), without the user
    // having navigated away from the search — only a genuine folder *list*
    // navigation (no mail_id in the path) should exit search mode.
    const isViewingResultMail =
      folderChanged && isMailDetailPath(pathname, folder)
    if (accountChanged || (folderChanged && !isViewingResultMail)) {
      dispatch(clearMailSearch())
    }
  }, [
    folder,
    resolvedAccountId,
    isAdvancedSearchRoute,
    pathname,
    mailSearch.isActive,
    mailSearch.accountId,
    mailSearch.folder,
    dispatch,
  ])

  const params = useMemo(() => {
    const urlParams = Array.from(searchParams.keys())
      .filter((key) => !EXCLUDED_PARAMS.includes(key))
      .reduce(
        (acc, key) => {
          const value = searchParams.get(key)
          if (value !== null) acc[key] = value
          return acc
        },
        {} as Record<string, string>
      )

    // URL params override defaults
    const merged: Record<string, string> = {
      ...MAIL_LIST_DEFAULTS,
      ...urlParams,
    }

    // Translate composite sort value to backend params
    const sortValue = merged.sort
    if (sortValue && SORT_PARAM_MAP[sortValue]) {
      const { sort_by, sort_order } = SORT_PARAM_MAP[sortValue]
      delete merged.sort
      merged.sort_by = sort_by
      merged.sort_order = sort_order
    } else {
      delete merged.sort
    }

    return merged
  }, [searchParams])

  const currentPage = Number(searchParams.get('page') ?? '1')

  const folderQueryResult = useGetFolderMessagesQuery(
    { folder, accountId: resolvedAccountId, params },
    {
      skip:
        isSearchActive ||
        isAdvancedSearchRoute ||
        skipFolderFetch ||
        !isSelectable ||
        isFolderLoading,
    }
  )

  const searchQueryResult = useSearchMailsQuery(
    {
      accountId: resolvedAccountId,
      body: mailSearch.params ?? {},
      params: { page: currentPage, page_size: params.page_size },
    },
    { skip: !isSearchActive }
  )

  const queryResult = isSearchActive ? searchQueryResult : folderQueryResult
  const { data } = queryResult

  // While a search is active, the list conceptually lives at `mailSearch.folder`
  // (the route the search was triggered from) even if the current route's
  // `folder` is temporarily a specific result's own real folder (i.e. the
  // user drilled into a cross-folder result — see the effect above). Using
  // the raw route `folder` here in that case would silently retarget
  // use-mail-detail-navigation's prev/next context at that one mail's
  // folder instead of the search results list.
  const navigationFolder =
    isSearchActive && mailSearch.folder ? mailSearch.folder : folder

  useEffect(() => {
    if (!data?.mails) return
    dispatch(
      setMailNavigation({
        folderKey: `${resolvedAccountId}/${navigationFolder}`,
        orderedIds: data.mails.map((m) => m.id),
        // Search results can span multiple folders; each mail's own `folder`
        // (only set on search results) is what prev/next navigation must
        // open it with, falling back to the list's folder otherwise.
        folderById: Object.fromEntries(
          data.mails.map((m) => [m.id, m.folder ?? navigationFolder])
        ),
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
      })
    )
  }, [data, resolvedAccountId, navigationFolder, dispatch])

  return {
    ...queryResult,
    currentPage,
    params,
    isVirtualFolder: isVirtual,
    isSearchActive,
  }
}
