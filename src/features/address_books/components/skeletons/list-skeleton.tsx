import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import AddressBookListSkeleton from './skeleton'

const ListSkeleton: React.FC = () => {
  return (
    <div role="list-skeleton" className="flex w-full flex-col rounded p-4">
      <div
        role="header-skeleton"
        className="text-muted-foreground flex flex-row items-center justify-between"
      >
        <Skeleton role="header-item-skeleton" className="h-6 w-1/8" />
        <Skeleton role="header-item-skeleton" className="h-6 w-1/8" />
      </div>
      <ul className="mt-4">
        <li>
          <AddressBookListSkeleton />
        </li>
        <li>
          <AddressBookListSkeleton />
        </li>
        <li>
          <AddressBookListSkeleton />
        </li>
        <li>
          <AddressBookListSkeleton />
        </li>
        <li>
          <AddressBookListSkeleton />
        </li>
      </ul>
    </div>
  )
}

export default ListSkeleton
