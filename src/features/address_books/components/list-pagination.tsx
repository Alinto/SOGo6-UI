'use client'

import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { selectAddressBooksUi, setPage } from '../store/address-books-ui-slice'

type AddressBookListPaginationProps = {
  totalPages: number
  currentPage: number
}

function AddressBookListPagination({
  totalPages,
  currentPage,
}: AddressBookListPaginationProps) {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const dispatch = useAppDispatch()
  const { page } = useAppSelector(selectAddressBooksUi)

  const effectiveTotalPages = Math.max(totalPages, 1)
  const effectivePage = Math.min(Math.max(1, currentPage || page), effectiveTotalPages)

  if (effectiveTotalPages <= 1) {
    return null
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={effectivePage <= 1}
        aria-label={t('pagination.previous.string')}
        onClick={() => dispatch(setPage(effectivePage - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-muted-foreground text-sm tabular-nums">
        {t('pagination.page.string', {
          page: effectivePage,
          total: effectiveTotalPages,
        })}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={effectivePage >= effectiveTotalPages}
        aria-label={t('pagination.next.string')}
        onClick={() => dispatch(setPage(effectivePage + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default memo(AddressBookListPagination)
