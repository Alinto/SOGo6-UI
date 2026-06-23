'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import {
  selectAddressBooksUi,
  setPage,
  setPageSize,
} from '../store/address-books-ui-slice'

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const

type AddressBookListPaginationProps = {
  totalPages: number
  currentPage: number
  showPageSize?: boolean
}

function AddressBookListPagination({
  totalPages,
  currentPage,
  showPageSize = true,
}: AddressBookListPaginationProps) {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const dispatch = useAppDispatch()
  const { page, pageSize } = useAppSelector(selectAddressBooksUi)

  const effectiveTotalPages = Math.max(totalPages, 1)
  const effectivePage = Math.min(
    Math.max(1, currentPage || page),
    effectiveTotalPages
  )

  if (effectiveTotalPages <= 1 && !showPageSize) {
    return null
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {showPageSize && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {t('pagination.page_size.string')}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => dispatch(setPageSize(Number(value)))}
          >
            <SelectTrigger className="h-8 w-[4.5rem] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {effectiveTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
      )}

      {showPageSize && (
        <p className="text-muted-foreground text-center text-xs">
          {t('pagination.contacts_page_hint.string')}
        </p>
      )}
    </div>
  )
}

export default memo(AddressBookListPagination)
