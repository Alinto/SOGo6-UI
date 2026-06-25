'use client'

import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useActiveAddressBookWritable } from '../hooks/use-active-address-book'

function ReadOnlyBanner() {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const { writable, book } = useActiveAddressBookWritable()

  if (writable || !book) {
    return null
  }

  return (
    <div
      className="bg-muted text-muted-foreground border-b px-4 py-2 text-sm"
      data-testid="address-book-read-only-banner"
      role="status"
    >
      {t('read_only_banner.string', { name: book.name })}
    </div>
  )
}

export default memo(ReadOnlyBanner)
