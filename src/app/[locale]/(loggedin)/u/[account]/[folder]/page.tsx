'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'

const Page = () => {
  const { folder } = useParams()
  const folderString = Array.isArray(folder) ? folder.join('/') : (folder ?? '')
  const searchParams = useSearchParams()

  const params = React.useMemo(() => {
    const searchParamsKeys = Array.from(searchParams.keys())
    return searchParamsKeys.reduce(
      (acc, key) => {
        const value = searchParams.get(key)
        if (value !== null) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, string>
    )
  }, [searchParams])

  const { data, isLoading, error } = useGetFolderMessagesQuery({
    folder: folderString,
    params,
  })

  if (isLoading) {
    return <ListSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h2>Error</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  return (
    <MessagesList
      items={data?.mails ?? []}
      page={data?.page ?? 1}
      total={data?.total ?? 0}
      totalPages={data?.totalPages ?? 1}
      hasNextPage={data?.hasNextPage ?? false}
      hasPreviousPage={data?.hasPreviousPage ?? false}
      isLoading={isLoading}
    />
  )
}

export default Page
