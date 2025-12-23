'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

interface PageProps {
  params: {
    locale: string
    account: string
    messagesFolder: string
  }
}

const Page: React.FC<PageProps> = () => {
  const { folder } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const searchParams = useSearchParams()
  const searchParamsKeys = Array.from(searchParams.keys())

  const params = searchParamsKeys.reduce(
    (acc, key) => {
      const value = searchParams.get(key)
      if (value !== null) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, string>
  )
  const { data, isLoading, refetch } = useGetFolderMessagesQuery({
    folder: folderString,
    params,
  })

  // Enable real-time mail updates via SSE for INBOX and common folders
  // useMailReceivedListener(folderString, params)

  useEffect(() => {
    // If the folder changes, we want to refetch the messages
    // This is necessary because the folder can be a dynamic segment in the URL
    // and we need to ensure that the messages are updated accordingly
    if (isLoading) return
    // This will ensure that the messages are refetched when the folder changes
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderString, refetch])

  if (isLoading) {
    return <ListSkeleton />
  }

  return (
    <MessagesList
      items={data?.messages ?? []}
      page={data?.page ?? 1}
      total={data?.total}
      totalPages={data?.totalPages}
      hasNextPage={data?.hasNextPage}
      hasPreviousPage={data?.hasPreviousPage}
      isLoading={isLoading}
    />
  )
}

export default Page
