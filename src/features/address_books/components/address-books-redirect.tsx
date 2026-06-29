'use client'

import ListSkeleton from '@/features/address_books/components/skeletons/list-skeleton'
import { useGetAddressBooksQuery } from '@/features/address_books/store/address-books-api'
import { resolveDefaultAddressBookId } from '@/features/address_books/utils/resolve-default-book'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { memo, useEffect } from 'react'

function AddressBooksRedirect() {
  const t = useTranslations('CONTACT_FORM')
  const { push } = useRouter()
  const { data, isLoading, isError } = useGetAddressBooksQuery()

  useEffect(() => {
    if (!data) return
    const bookId = resolveDefaultAddressBookId(data)
    if (bookId) {
      push(`/address_books/${bookId}`)
    }
  }, [data, push])

  if (isLoading) {
    return (
      <div className="flex min-h-full">
        <ListSkeleton />
      </div>
    )
  }

  if (isError || !data || !resolveDefaultAddressBookId(data)) {
    return (
      <div className="text-destructive flex min-h-full items-center justify-center p-8 text-sm">
        {t('load_error.list.string')}
      </div>
    )
  }

  return null
}

export default memo(AddressBooksRedirect)
