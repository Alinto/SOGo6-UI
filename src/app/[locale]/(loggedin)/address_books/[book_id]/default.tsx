'use client'

import AddressBookList from '@/features/address_books/components/list'
import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { useAddressBookEntries } from '@/features/address_books/hooks/use-address-book-entries'
import { routeParam } from '@/features/address_books/utils/route-param'
import { useParams } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  const { book_id } = useParams()
  const { items, isFetching, totalPages, page, searchTooShort } =
    useAddressBookEntries(routeParam(book_id) ?? null)

  return (
    <div className="flex min-h-full">
      {isFetching ? (
        <ListSkeleton />
      ) : (
        <AddressBookList
          items={items}
          isLoading={isFetching}
          serverSide
          totalPages={totalPages}
          currentPage={page}
          searchTooShort={searchTooShort}
        />
      )}
    </div>
  )
}

export default AddressBooksPage
