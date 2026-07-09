'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

const Page = () => {
  const { folder, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const { data, isLoading, isFetching, error, refetch, currentPage, isVirtualFolder } =
    useFolderMessages({
      folder: folderPath,
      accountId: accountString,
    })

  useEffect(() => {
    dispatch(setSkipFolderFetch(false))
  }, [folderPath, dispatch])

  const clientFilterActive = activeFilter !== 'all'

  // Keep the URL page in range: if the current page no longer exists (e.g. the
  // last mail of the last page was deleted/moved), fall back to the last valid page.
  useEffect(() => {
    if (isLoading || isFetching || error || clientFilterActive || !data) return
    const totalPages = data.totalPages ?? 1
    if (currentPage <= 1 || currentPage <= totalPages) return
    const target = Math.max(1, totalPages)
    const params = new URLSearchParams(searchParams.toString())
    if (target === 1) {
      params.delete('page')
    } else {
      params.set('page', String(target))
    }
    const query = params.toString()
    replace(query ? `${pathname}?${query}` : pathname)
  }, [
    data,
    isLoading,
    isFetching,
    error,
    clientFilterActive,
    currentPage,
    searchParams,
    pathname,
    replace,
  ])

  const filteredMails = React.useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  if (isVirtualFolder) {
    return <VirtualFolderEmptyState />
  }

  if (isLoading) return <ListSkeleton />

  if (error) {
    return (
      <FolderMessagesErrorFallback
        error={error}
        refetch={() => {
          void refetch()
        }}
        accountId={accountString}
      />
    )
  }

  return (
    <MessagesList
      items={filteredMails}
      page={clientFilterActive ? 1 : (data?.page ?? 1)}
      total={clientFilterActive ? filteredMails.length : (data?.total ?? 0)}
      totalPages={clientFilterActive ? 1 : (data?.totalPages ?? 1)}
      hasNextPage={clientFilterActive ? false : (data?.hasNextPage ?? false)}
      hasPreviousPage={clientFilterActive ? false : (data?.hasPreviousPage ?? false)}
      isLoading={isLoading}
      isFetching={isFetching}
      hideToolbar
    />
  )
}

export default Page
