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
        className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center"
      >
        <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
          <SearchX className="text-muted-foreground h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('search_empty_title.string')}</p>
          <p className="text-muted-foreground max-w-xs text-xs">
            {t('search_empty_description.string')}
          </p>
        </div>
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
      className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center"
    >
      <div className="bg-muted/50 flex h-14 w-14 items-center justify-center rounded-full">
        <BookUser className="text-muted-foreground h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('empty_title.string')}</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          {t('empty_description.string')}
        </p>
      </div>
      <Button type="button" size="sm" onClick={handleCreateContact}>
        {t('empty_create_contact.string')}
      </Button>
    </div>
  )
}

export default memo(AddressBookEmptyState)
