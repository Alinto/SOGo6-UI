'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import MailListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'

const Page: React.FC = () => {
  const { folder, mail_id, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const { data, isLoading, isFetching, error, refetch, isVirtualFolder } =
    useFolderMessages({
      folder: folderPath,
      accountId: accountString,
    })

  useEffect(() => {
    dispatch(setSkipFolderFetch(false))
  }, [folderPath, dispatch])

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const clientFilterActive = activeFilter !== 'all'

  const containerClassName = `${mail_id ? 'hidden lg:flex' : 'flex'} w-full`

  if (isVirtualFolder) {
    return (
      <div className={containerClassName}>
        <VirtualFolderEmptyState />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <MailListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={containerClassName}>
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
    <div className={containerClassName}>
      <MessagesList
        type="classic"
        items={filteredMails}
        page={clientFilterActive ? 1 : (data?.page ?? 1)}
        total={clientFilterActive ? filteredMails.length : (data?.total ?? 0)}
        totalPages={clientFilterActive ? 1 : (data?.totalPages ?? 1)}
        hasNextPage={clientFilterActive ? false : (data?.hasNextPage ?? false)}
        hasPreviousPage={clientFilterActive ? false : (data?.hasPreviousPage ?? false)}
        isLoading={false}
        isFetching={isFetching}
        hideToolbar
      />
    </div>
  )
}

export default Page
