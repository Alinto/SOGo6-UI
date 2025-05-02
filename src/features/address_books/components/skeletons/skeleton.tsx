import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const AddressBookListSkeleton: React.FC = () => {
  return (
    <Skeleton
      role="item-skeleton"
      className={'flex h-14 flex-row items-center my-1 gap-2 p-2 rounded-full'}
    />
  )
}

export default AddressBookListSkeleton
