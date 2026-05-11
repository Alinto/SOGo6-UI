'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

interface ListPaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

const ListPagination: React.FC<ListPaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}) => {
  const { push } = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const t = useTranslations('MAILS_LIST')
  const effectiveTotalPages = totalPages > 0 ? totalPages : 1
  const effectivePage = Math.min(
    Math.max(1, currentPage),
    effectiveTotalPages
  )
  const handlePrev = () => {
    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams.toString())
      if (currentPage - 1 === 1) {
        params.delete('page')
      } else {
        params.set('page', (currentPage - 1).toString())
      }
      const query = params.toString()
      push(query ? `${pathname}?${query}` : pathname)
    }
  }

  const onPageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const query = params.toString()
    push(query ? `${pathname}?${query}` : pathname)
  }

  const handleNext = () => {
    if (currentPage < effectiveTotalPages) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', (currentPage + 1).toString())
      push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <div className="flex items-center">
      <Button
        variant={'outline'}
        size={'icon'}
        onClick={handlePrev}
        disabled={!hasPreviousPage || effectivePage === 1}
        aria-label={t('pagination.previous.string')}
        aria-disabled={effectivePage === 1}
      >
        <ChevronLeft />
      </Button>
      {!isMobile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              // eslint-disable-next-line react/jsx-no-literals
            >{`${effectivePage} / ${effectiveTotalPages}`}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="scrollbar-thin-gray max-h-60 w-10 overflow-auto">
            <DropdownMenuRadioGroup
              value={effectivePage.toString()}
              onValueChange={(value) => {
                const page = parseInt(value, 10)
                if (!isNaN(page)) onPageChange(page)
              }}
            >
              {Array.from({ length: effectiveTotalPages }, (_, i) => (
                <DropdownMenuRadioItem
                  key={i + 1}
                  className="cursor-pointer"
                  value={(i + 1).toString()}
                >
                  {i + 1}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button
        size={'icon'}
        variant={'outline'}
        onClick={handleNext}
        aria-label={t('pagination.next.string')}
        disabled={!hasNextPage || effectivePage === effectiveTotalPages}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}

export default ListPagination
