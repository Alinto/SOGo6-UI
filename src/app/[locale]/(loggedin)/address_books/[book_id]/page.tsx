'use client'

import AddressBookList from '@/features/address_books/components/list'
import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { useGetAddressBookVCardsQuery } from '@/features/address_books/store/address-books-api'
import { useParams } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  const { book_id } = useParams()
  const { data, isFetching, error } = useGetAddressBookVCardsQuery(
    book_id as string
  )
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-row gap-4">
        {/* List Column */}
        {isFetching ? (
          <ListSkeleton />
        ) : (
          <AddressBookList items={data || []} isLoading={isFetching} />
        )}

        {/* Selected Item Display Column */}
        <div className="md:flex md:flex-col hidden md:w-1/2 lg:w-3/5 md:p-4 md:rounded">
          <p className="mt-4 text-gray-500">No item selected.</p>
        </div>
      </div>
    </div>
  )
}

export default AddressBooksPage
