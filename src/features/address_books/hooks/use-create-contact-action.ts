'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { UserPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { openCreateForm } from '../store/address-books-ui-slice'
import { useActiveAddressBookWritable } from './use-active-address-book'

export function useCreateContactAction(options?: {
  closeMobileSidebar?: boolean
}) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const { book_id } = useParams()
  const { writable } = useActiveAddressBookWritable()
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const onClick = useCallback(() => {
    if (!writable || book_id === ALL_CONTACTS_BOOK_ID) return
    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }
    dispatch(
      openCreateForm({
        bookId: typeof book_id === 'string' ? book_id : undefined,
      })
    )
  }, [book_id, closeMobileSidebar, dispatch, isMobile, setOpenMobile, writable])

  return {
    onClick,
    label: t('new_contact.string'),
    icon: UserPlus as LucideIcon,
    disabled: !writable || book_id === ALL_CONTACTS_BOOK_ID,
  }
}
