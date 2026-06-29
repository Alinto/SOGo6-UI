'use client'

import AddressBookList from '@/features/address_books/components/list'
import ReadOnlyBanner from '@/features/address_books/components/read-only-banner'
import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { ALL_CONTACTS_BOOK_ID } from '@/features/address_books/address-books-constants'
import { useAddressBookEntriesContext } from '@/features/address_books/hooks/address-book-entries-context'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  const { book_id } = useParams()
  const t = useTranslations('CONTACT_FORM')
  const resolvedBookId = typeof book_id === 'string' ? book_id : null
  const isAllContactsView = resolvedBookId === ALL_CONTACTS_BOOK_ID
  const {
    items,
    isFetching,
    isError,
    totalPages,
    page,
    contactTotal,
    listTotal,
    searchTooShort,
  } = useAddressBookEntriesContext()

  if (isError) {
    return (
      <div className="text-destructive flex min-h-full items-center justify-center p-8 text-sm">
        {t('load_error.list.string')}
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {!isAllContactsView && <ReadOnlyBanner />}
      <div className="flex min-h-full flex-1">
      {isFetching ? (
        <ListSkeleton />
      ) : (
        <AddressBookList
          items={items}
          isLoading={isFetching}
          serverSide
          totalPages={totalPages}
          currentPage={page}
          contactTotal={contactTotal}
          listTotal={listTotal}
          searchTooShort={searchTooShort}
          allContactsView={isAllContactsView}
        />
      )}
      </div>
    </div>
  )
}

export default AddressBooksPage
