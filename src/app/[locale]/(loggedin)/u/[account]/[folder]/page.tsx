'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import {
  selectSkipFolderFetch,
  setMailNavigation,
  setSkipFolderFetch,
} from '@/features/mails/store/mail-navigation-slice'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

const EXCLUDED_PARAMS = ['filter']

const Page = () => {
  const { folder, account } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const skipFolderFetch = useAppSelector(selectSkipFolderFetch)
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const activeSort = searchParams.get('sort') ?? 't_asc'
  const t = useTranslations('MAILS_COMMONS')

  const params = React.useMemo(() => {
    const searchParamsKeys = Array.from(searchParams.keys()).filter(
      (key) => !EXCLUDED_PARAMS.includes(key)
    )
    return searchParamsKeys.reduce(
      (acc, key) => {
        const value = searchParams.get(key)
        if (value !== null) acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )
  }, [searchParams])

  const { data, isLoading, error } = useGetFolderMessagesQuery(
    { folder: folderString, params },
    { skip: skipFolderFetch }
  )

  useEffect(() => {
    dispatch(setSkipFolderFetch(false))
  }, [folderString, dispatch])

  useEffect(() => {
    if (!data?.mails) return
    dispatch(
      setMailNavigation({
        folderKey: `${accountString}/${folderString}`,
        orderedIds: data.mails.map((m) => m.id),
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
      })
    )
  }, [data, accountString, folderString, dispatch])

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

  if (skipFolderFetch) return <ListSkeleton />

  if (isLoading) return <ListSkeleton />

  if (error && !skipFolderFetch) {
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
      hideToolbar
    />
  )
}

export default Page
