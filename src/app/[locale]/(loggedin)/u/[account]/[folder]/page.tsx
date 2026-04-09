'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import {
  setSkipFolderFetch,
} from '@/features/mails/store/mail-navigation-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

const Page = () => {
  const { folder, account } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const t = useTranslations('MAILS_COMMONS')

  const { data, isLoading, isFetching, error } = useFolderMessages({
    folder: folderString,
    accountId: accountString,
  })

  useEffect(() => {
    dispatch(setSkipFolderFetch(false))
  }, [folderString, dispatch])

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

  if (isLoading) return <ListSkeleton />

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h2>{t('error.string')}</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  return (
    <MessagesList
      items={filteredMails}
      page={data?.page ?? 1}
      total={data?.total ?? 0}
      totalPages={data?.totalPages ?? 1}
      hasNextPage={data?.hasNextPage ?? false}
      hasPreviousPage={data?.hasPreviousPage ?? false}
      isLoading={isLoading}
      isFetching={isFetching}
      hideToolbar
    />
  )
}

export default Page
