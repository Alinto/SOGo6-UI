'use client'

import AddressBookList from '@/features/address_books/components/list'
import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { useGetAddressBookVCardsQuery } from '@/features/address_books/store/address-books-api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  const { book_id } = useParams()
  const t = useTranslations('CONTACT_FORM')
  const { data, isFetching, isError } = useGetAddressBookVCardsQuery(
    book_id as string
  )

  if (isError) {
    return (
      <div className="text-destructive flex min-h-full items-center justify-center p-8 text-sm">
        {t('load_error.list.string')}
      </div>
    )
  }

  return (
    <div className="flex min-h-full">
      {isFetching ? (
        <ListSkeleton />
      ) : (
        <AddressBookList items={data || []} isLoading={isFetching} />
      )}
    </div>
  )
}

export default AddressBooksPage
