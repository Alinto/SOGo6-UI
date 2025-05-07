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

  return isFetching ? (
    <ListSkeleton />
  ) : (
    <AddressBookList items={data || []} isLoading={isFetching} />
  )
}

export default AddressBooksPage
