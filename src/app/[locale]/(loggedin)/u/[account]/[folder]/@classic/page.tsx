'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { RootState } from '@/lib/redux/store'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const EXCLUDED_PARAMS = ['filter']

const Page: React.FC = () => {
  const { folder, mail_id } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const mailLayoutMode = useSelector((state: RootState) => state.mailLayout.mode)
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const activeSort = searchParams.get('sort') ?? 't_asc'

  const params = React.useMemo(() => {
    const keys = Array.from(searchParams.keys()).filter(
      (key) => !EXCLUDED_PARAMS.includes(key)
    )
    return keys.reduce(
      (acc, key) => {
        const value = searchParams.get(key)
        if (value !== null) acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )
  }, [searchParams])

  const { data, isFetching } = useGetFolderMessagesQuery({
    folder: folderString,
    params,
  })

  const filteredMails = React.useMemo(() => {
    const mails = data?.mails ?? []

    let result = mails
    switch (activeFilter) {
      case 'unread':      result = mails.filter((m) => !m.seen); break
      case 'read':        result = mails.filter((m) => m.seen); break
      case 'starred':     result = mails.filter((m) => m.flagged); break
      case 'attachments': result = mails.filter((m) => m.hasAttachment); break
    }

    return [...result].sort((a, b) => {
      switch (activeSort) {
        case 't_asc':  return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        case 't_desc': return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
        case 's_asc':  return (a.size ?? 0) - (b.size ?? 0)
        case 's_desc': return (b.size ?? 0) - (a.size ?? 0)
        default:       return 0
      }
    })
  }, [data, activeFilter, activeSort])

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
