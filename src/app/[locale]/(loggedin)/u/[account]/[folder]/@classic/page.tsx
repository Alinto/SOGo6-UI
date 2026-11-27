'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-loading-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useMailListLabels } from '@/features/mails/hooks/use-mail-list-labels'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import CachedDataIndicator from '@/features/offline/components/cached-data-indicator'
import {
  isCacheableListView,
  useOfflineMailList,
} from '@/features/offline/hooks/use-offline-mail-list'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { folderLabelFromPath } from '@/features/offline/utils/cache-clock'
import { RootState } from '@/lib/redux/store'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const Page: React.FC = () => {
  const { folder, account, mail_id } = useParams()
  const { folderPathOverride } = useOfflineNav()
  const folderPath =
    folderPathOverride ??
    folderPathFromParams(folder as string | string[] | undefined)
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const mailLayoutMode = useSelector(
    (state: RootState) => state.mailLayout.mode
  )
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const activeLabels = useMailListLabels()

  const {
    data,
    currentData,
    isUserFetching,
    isRefreshing,
    isLoading,
    error,
    refetch,
    isVirtualFolder,
    isSearchActive,
    currentPage,
    clientLabels,
  } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
    reloadOnFolderSwitch: true,
  })

  const { cachedMails, cachedAt, isShowingCache } = useOfflineMailList({
    accountId: accountString,
    folderPath,
    mails: data?.mails,
    error,
    // Only the plain first page of a real folder may feed its snapshot,
    // and only once it answers the current arguments (`data` keeps the
    // previous sort/page while the new one loads).
    writeThrough:
      currentData !== undefined &&
      currentData === data &&
      isCacheableListView({
        page: data?.page ?? currentPage,
        isSearchActive,
        isVirtualFolder,
        filter: searchParams.get('filter'),
        sort: searchParams.get('sort'),
      }),
    isComplete: data?.hasNextPage === false,
  })

  // The server filters folder lists; only search results are filtered here.
  // During a search the quick filters narrow the search itself (see
  // useFolderMessages): only the labels it cannot express are left here.

  const filteredMails = React.useMemo(
    () => getClientFilteredMails(data?.mails ?? [], 'all', clientLabels),
    [data, clientLabels]
  )

  const listVisibilityClass =
    mailLayoutMode === 'split'
      ? 'flex'
      : `${mail_id ? 'hidden lg:flex' : 'flex'}`

  if (isVirtualFolder && !isSearchActive) {
    return (
      <div
        className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}
      >
        <VirtualFolderEmptyState />
      </div>
    )
  }

  if (isShowingCache && cachedMails) {
    const offlineFiltered = getClientFilteredMails(
      cachedMails,
      activeFilter,
      activeLabels
    )
    return (
      <div
        className={`${listVisibilityClass} h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}
      >
        <CachedDataIndicator
          className="px-4 py-2"
          asOf={cachedAt}
          folder={folderLabelFromPath(folderPath)}
          showOnline
        />
        <MessagesList
          type="classic"
          items={offlineFiltered}
          page={1}
          total={offlineFiltered.length}
          totalPages={1}
          hasNextPage={false}
          hasPreviousPage={false}
          isLoading={false}
          hideToolbar
        />
      </div>
    )
  }

  // Until a response arrives (query pending or skipped while the folder tree
  // loads), `data` is undefined: show the skeleton, not "No message found".
  const isAwaitingFirstResponse = data === undefined && !error

  if (isLoading || isUserFetching || isAwaitingFirstResponse) {
    return (
      <div
        className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}
      >
        <ListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}
      >
        <FolderMessagesErrorFallback
          error={error}
          refetch={() => {
            void refetch()
          }}
          accountId={accountString}
        />
      </div>
    )
  }

  return (
    <div
      className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}
    >
      <MessagesList
        type="classic"
        items={filteredMails}
        page={data?.page ?? 1}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        hasNextPage={data?.hasNextPage ?? false}
        hasPreviousPage={data?.hasPreviousPage ?? false}
        isLoading={false}
        isRefreshing={isRefreshing}
        hideToolbar
      />
    </div>
  )
}

export default Page
