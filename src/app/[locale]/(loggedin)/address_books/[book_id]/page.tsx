'use client'

import AddressBookList from '@/features/address_books/components/list'
import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { useAddressBookEntries } from '@/features/address_books/hooks/use-address-book-entries'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  const { book_id } = useParams()
  const t = useTranslations('CONTACT_FORM')
  const {
    items,
    isFetching,
    isError,
    totalPages,
    page,
    searchTooShort,
  } = useAddressBookEntries(typeof book_id === 'string' ? book_id : null)

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
