'use client'

import { Button } from '@/components/ui/button'
import { openCreateForm } from '@/features/address_books/store/address-books-ui-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { BookUser, SearchX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

type AddressBookEmptyStateProps = {
  variant: 'empty' | 'search'
  bookId?: string
  onClearSearch?: () => void
}

function AddressBookEmptyState({
  variant,
  bookId,
  onClearSearch,
}: AddressBookEmptyStateProps) {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const dispatch = useAppDispatch()

  const handleCreateContact = () => {
    dispatch(openCreateForm({ bookId }))
  }

  if (variant === 'search') {
    return (
      <div
        data-testid="address-book-search-empty"
        className="flex flex-col items-center justify-center gap-3 py-12 text-center"
      >
        <SearchX className="text-muted-foreground h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">{t('search_empty_title.string')}</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          {t('search_empty_description.string')}
        </p>
        {onClearSearch && (
          <Button type="button" variant="outline" size="sm" onClick={onClearSearch}>
            {t('clear_search.string')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      data-testid="address-book-empty-state"
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <BookUser className="text-muted-foreground h-12 w-12 opacity-40" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('empty_title.string')}</p>
        <p className="text-muted-foreground max-w-sm text-xs">
          {t('empty_description.string')}
        </p>
      </div>
      <Button type="button" onClick={handleCreateContact}>
        {t('empty_create_contact.string')}
      </Button>
    </div>
  )
}

export default memo(AddressBookEmptyState)
