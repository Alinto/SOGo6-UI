'use client'

import { Button } from '@/components/ui/button'
import { ALL_CONTACTS_BOOK_ID } from '@/features/address_books/address-books-constants'
import {
  AddressBookEntriesProvider,
  useAddressBookEntriesContext,
} from '@/features/address_books/hooks/address-book-entries-context'
import { setSearchQuery } from '@/features/address_books/store/address-books-ui-slice'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/lib/redux/hooks'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

function AddressBookLayoutShell({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  const pathname = usePathname()
  const { push } = useRouter()
  const { book_id } = useParams()
  const t = useTranslations('CONTACT_FORM')

  const { contactTotal, listTotal, isFetching } = useAddressBookEntriesContext()
  const isBookEmpty =
    !isFetching && contactTotal === 0 && listTotal === 0

  const resolvedBookId = typeof book_id === 'string' ? book_id : null
  const basePath = `/address_books/${book_id}`
  const isContactSelected =
    pathname !== basePath && pathname.startsWith(`${basePath}/`)

  const handleBack = () => {
    push(basePath)
  }

  const showVisualizationPanel = !isBookEmpty

  return (
    <div className="flex min-h-full min-w-0">
      <div
        className={cn(
          'w-full min-w-0 md:rounded',
          showVisualizationPanel
            ? 'md:w-1/2 lg:w-2/5'
            : 'md:w-full lg:w-full',
          isContactSelected ? 'hidden md:block' : 'block'
        )}
      >
        {children}
      </div>

      {showVisualizationPanel && (
        <div className="hidden min-w-0 md:flex md:w-1/2 md:rounded lg:w-3/5">
          {visualization}
        </div>
      )}

      {isContactSelected && (
        <div className="bg-background fixed inset-0 z-50 flex flex-col md:hidden">
          <div className="flex items-center gap-2 border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label={t('back_to_list.string')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {t('contact_details.string')}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">{visualization}</div>
        </div>
      )}
    </div>
  )
}

export default function Layout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  const dispatch = useAppDispatch()
  const { book_id } = useParams()
  const resolvedBookId = typeof book_id === 'string' ? book_id : null

  useEffect(() => {
    if (typeof book_id === 'string') {
      dispatch(setSearchQuery(''))
    }
  }, [book_id, dispatch])

  return (
    <AddressBookEntriesProvider bookId={resolvedBookId}>
      <AddressBookLayoutShell visualization={visualization}>
        {children}
      </AddressBookLayoutShell>
    </AddressBookEntriesProvider>
  )
}
