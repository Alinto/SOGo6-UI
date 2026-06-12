'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { RootState } from '@/lib/redux/store'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const Page: React.FC = () => {
  const { folder, account, mail_id } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const mailLayoutMode = useSelector((state: RootState) => state.mailLayout.mode)
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'

  const { data, isFetching } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  const filteredMails = React.useMemo(() => {
    const mails = data?.mails ?? []

    switch (activeFilter) {
      case 'unread':      return mails.filter((m) => !m.seen)
      case 'read':        return mails.filter((m) => m.seen)
      case 'starred':     return mails.filter((m) => m.flagged)
      case 'attachments': return mails.filter((m) => m.hasAttachment)
      default:            return mails
    }
  }, [data, activeFilter])

  const listVisibilityClass =
    mailLayoutMode === 'split'
      ? 'flex'
      : `${mail_id ? 'hidden lg:flex' : 'flex'}`

  if (isFetching) {
    return (
      <div className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}>
        <ListSkeleton />
      </div>
    )
  }

  return (
    <div className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}>
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
