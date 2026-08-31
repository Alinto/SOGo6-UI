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
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { useCurrentFolder } from './use-current-folder'

const EXCLUDED_PARAMS = ['filter']

const MAIL_LIST_DEFAULTS: Record<string, string> = {
  fields: 'contents',
  fields_action: 'exclude',
  page_size: '20',
}

const SORT_PARAM_MAP: Record<string, { sort_by: string; sort_order: string }> = {
  t_asc:  { sort_by: 'date', sort_order: 'desc' },
  t_desc: { sort_by: 'date', sort_order: 'asc'  },
  s_asc:  { sort_by: 'size', sort_order: 'asc'  },
  s_desc: { sort_by: 'size', sort_order: 'desc' },
}

interface UseFolderMessagesOptions {
  folder: string
  accountId?: string
}

export function useFolderMessages({ folder, accountId }: UseFolderMessagesOptions) {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const skipFolderFetch = useAppSelector(selectSkipFolderFetch)
  const mailSearch = useAppSelector((state) => state.mailSearch)
  const { isSelectable, isVirtual, isLoading: isFolderLoading } =
    useCurrentFolder(folder, accountId)

  const resolvedAccountId = accountId ?? '0'
  const isSearchActive =
    mailSearch.isActive && mailSearch.accountId === resolvedAccountId

  // Navigating to a different folder while a search is active leaves the
  // results view; clear it so the newly opened folder shows its own mails.
  // This is tracked against `mailSearch.folder` (Redux) rather than a local
  // ref: this hook is called from page-level components, which Next.js
  // remounts on every navigation, so a component-local "previous folder"
  // would always initialize to the new folder and never see it change.
  useEffect(() => {
    if (isSearchActive && mailSearch.folder != null && mailSearch.folder !== folder) {
      dispatch(clearMailSearch())
    }
  }, [folder, isSearchActive, mailSearch.folder, dispatch])

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
    const merged: Record<string, string> = { ...MAIL_LIST_DEFAULTS, ...urlParams }

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
    { skip: isSearchActive || skipFolderFetch || !isSelectable || isFolderLoading }
  )

  const searchQueryResult = useSearchMailsQuery(
    { accountId: resolvedAccountId, body: mailSearch.params ?? {} },
    { skip: !isSearchActive }
  )

  const queryResult = isSearchActive ? searchQueryResult : folderQueryResult
  const { data } = queryResult

  useEffect(() => {
    if (!data?.mails) return
    dispatch(
      setMailNavigation({
        folderKey: isSearchActive
          ? `search/${resolvedAccountId}`
          : `${resolvedAccountId}/${folder}`,
        orderedIds: data.mails.map((m) => m.id),
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
      })
    )
  }, [data, resolvedAccountId, folder, isSearchActive, dispatch])

  return {
    ...queryResult,
    currentPage,
    params,
    isVirtualFolder: isSearchActive ? false : isVirtual,
    isSearchActive,
  }
}
