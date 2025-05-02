import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import AddressBookListSkeleton from './skeleton'

const ListSkeleton: React.FC = () => {
  return (
    <div
      role="list-skeleton"
      className="flex flex-col w-full md:w-1/2 lg:w-2/5 p-4 rounded"
    >
      <div
        role="header-skeleton"
        className="flex flex-row items-center justify-between text-gray-500"
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
