'use client'

import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import type { MailNavigationContext } from '@/features/mails/utils/mail-detail-navigation'
import {
  isMailDetailPath,
  resolveMailIdFromPath,
} from '@/features/mails/utils/mail-detail-navigation'
import {
  ADVANCED_SEARCH_ROUTE_SEGMENT,
  mailSearchParamsToUrlSearchParams,
} from '@/features/mails/utils/mail-search-form'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useMailDetailNavigation() {
  const params = useParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const mailNavigation = useAppSelector((state) => state.mailNavigation)
  const mailSearch = useAppSelector((state) => state.mailSearch)

  const account = Array.isArray(params.account)
    ? params.account[0]
    : (params.account ?? '')
  const folder = folderPathFromParams(
    params.folder as string | string[] | undefined
  )

  const isOnMailDetailPath = isMailDetailPath(pathname, folder)

  const mailIdParam = Array.isArray(params.mail_id)
    ? params.mail_id[0]
    : params.mail_id

  const mailId = useMemo(() => {
    if (!isOnMailDetailPath) return null
    if (mailIdParam) return mailIdParam
    return resolveMailIdFromPath(pathname, folder)
  }, [isOnMailDetailPath, mailIdParam, pathname, folder])

  // A mail opened from cross-folder search results lives at its own actual
  // folder's route (sewiffers from
  // `mailSearch.folder` (the folder the search list itself is rendered at,
  // matching what useFolderMessages dispatched as `folderKey`). While the
  // search stays active, compare against the list's folder rather than the
  // current mail's folder so navigation state isn't considered stale.
  const isSearchActiveForAccount =
    mailSearch.isActive && mailSearch.accountId === account
  const listFolder =
    isSearchActiveForAccount && mailSearch.folder ? mailSearch.folder : folder
  const folderKey = `${account}/${listFolder}`
  const isNavigationValid = mailNavigation.folderKey === folderKey
  const currentIndex =
    mailId && isNavigationValid ? mailNavigation.orderedIds.indexOf(mailId) : -1

  const prevId =
    currentIndex > 0 ? mailNavigation.orderedIds[currentIndex - 1] : null
  const nextId =
    currentIndex !== -1 && currentIndex < mailNavigation.orderedIds.length - 1
      ? mailNavigation.orderedIds[currentIndex + 1]
      : null

  const isFirstOfPage = currentIndex === 0
  const isLastOfPage = currentIndex === mailNavigation.orderedIds.length - 1
  const hasPrevPage = mailNavigation.page > 1
  const hasNextPage = mailNavigation.page < mailNavigation.totalPages

  const canGoPrev =
    Boolean(prevId) || (isNavigationValid && isFirstOfPage && hasPrevPage)
  const canGoNext =
    Boolean(nextId) || (isNavigationValid && isLastOfPage && hasNextPage)

  // The list itself always lives at `listFolder`'s route, so returning to a
  // prev/next page (rather than a specific mail) targets that folder. The
  // advanced-search pseudo-folder's route is URL-driven (see
  // useSyncAdvancedSearchFromUrl), so its search criteria must be carried
  // along too — not just `page` — or landing back on it would restore an
  // empty search.
  const encodedListFolder = encodeURIComponent(listFolder)

  const buildListPageUrl = useCallback(
    (page: number) => {
      if (listFolder === ADVANCED_SEARCH_ROUTE_SEGMENT) {
        const query = mailSearchParamsToUrlSearchParams(mailSearch.params ?? {})
        query.set('page', String(page))
        return `/u/${account}/${ADVANCED_SEARCH_ROUTE_SEGMENT}?${query.toString()}`
      }
      return `/u/${account}/${encodedListFolder}?page=${page}`
    },
    [account, listFolder, encodedListFolder, mailSearch.params]
  )

  const goPrev = useCallback(() => {
    if (!mailId) return
    if (prevId) {
      const prevFolder = mailNavigation.folderById[prevId] ?? listFolder
      push(
        `/u/${account}/${encodeURIComponent(prevFolder)}/${encodeURIComponent(prevId)}`
      )
    } else if (isNavigationValid && isFirstOfPage && hasPrevPage) {
      push(buildListPageUrl(mailNavigation.page - 1))
    }
  }, [
    mailId,
    prevId,
    push,
    account,
    listFolder,
    buildListPageUrl,
    mailNavigation.folderById,
    isNavigationValid,
    isFirstOfPage,
    hasPrevPage,
    mailNavigation.page,
  ])

  const goNext = useCallback(() => {
    if (!mailId) return
    if (nextId) {
      const nextFolder = mailNavigation.folderById[nextId] ?? listFolder
      push(
        `/u/${account}/${encodeURIComponent(nextFolder)}/${encodeURIComponent(nextId)}`
      )
    } else if (isNavigationValid && isLastOfPage && hasNextPage) {
      push(buildListPageUrl(mailNavigation.page + 1))
    }
  }, [
    mailId,
    nextId,
    push,
    account,
    listFolder,
    buildListPageUrl,
    mailNavigation.folderById,
    isNavigationValid,
    isLastOfPage,
    hasNextPage,
    mailNavigation.page,
  ])

  // Mirrors the page-boundary logic above: the "back to list" button must
  // land on the list page the mail was opened from. A mail opened from the
  // advanced-search results must also return to that search (criteria +
  // page), not to its own real folder.
  const returnToListUrl = useMemo(() => {
    const page = isNavigationValid ? mailNavigation.page : 1
    if (listFolder === ADVANCED_SEARCH_ROUTE_SEGMENT) {
      return buildListPageUrl(page)
    }
    if (page <= 1) return null
    return buildListPageUrl(page)
  }, [listFolder, buildListPageUrl, isNavigationValid, mailNavigation.page])

  const navigationContext: MailNavigationContext = mailNavigation

  return {
    mailId,
    isActive: Boolean(mailId),
    isOnMailDetailPath,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    currentPosition: currentIndex >= 0 ? currentIndex + 1 : null,
    totalInPage: isNavigationValid ? mailNavigation.orderedIds.length : null,
    navigation: navigationContext,
    returnToListUrl,
  }
}
