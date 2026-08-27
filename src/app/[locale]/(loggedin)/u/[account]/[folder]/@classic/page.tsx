'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import CachedDataIndicator from '@/features/offline/components/cached-data-indicator'
import { useOfflineMailList } from '@/features/offline/hooks/use-offline-mail-list'
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

  const { data, isFetching, isLoading, error, refetch } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  const { cachedMails, cachedAt, isShowingCache } = useOfflineMailList({
    accountId: accountString,
    folderPath,
    mails: data?.mails,
    hasError: !!error,
  })

  const filteredMails = React.useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const listVisibilityClass =
    mailLayoutMode === 'split'
      ? 'flex'
      : `${mail_id ? 'hidden lg:flex' : 'flex'}`

  if (isShowingCache && cachedMails) {
    const offlineFiltered = getClientFilteredMails(cachedMails, activeFilter)
    return (
      <div
        className={`${listVisibilityClass} h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}
      >
        <CachedDataIndicator
          className="px-4 py-2"
          asOf={cachedAt}
          folder={folderLabelFromPath(folderPath)}
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
          isFetching={false}
          hideToolbar
        />
      </div>
    )
  }

  if (isLoading || (isFetching && !data)) {
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
        isLoading={isFetching}
        hideToolbar
      />
    </div>
  )
}

export default Page
