'use client'

import MessagesList from '@/features/mails/components/list'
import MailListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useParams } from 'next/navigation'
import React from 'react'

interface PageProps {
  params: {
    locale: string
    account: string
    messagesFolder: string
  }
}

const Page: React.FC<PageProps> = () => {
  const { folder, mail_id } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const { data, isFetching } = useGetFolderMessagesQuery({
    folder: folderString,
  })
  if (isFetching) {
    return (
      <div
        className={`${mail_id ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/2 xl:w-1/2 2xl:w-1/3`}
      >
        <MailListSkeleton />
      </div>
    )
  }
  return (
    <div
      className={`${mail_id ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/2 xl:w-1/2 2xl:w-1/3`}
    >
      <MessagesList type="classic" items={data} isLoading={isFetching} />
    </div>
  )
}

export default Page
