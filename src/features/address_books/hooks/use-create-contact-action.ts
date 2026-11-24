'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { UserPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { useGetAddressBooksQuery } from '../store/address-books-api'
import {
  openCreateForm,
  selectRightsByBook,
} from '../store/address-books-ui-slice'
import { listCreatableAddressBooks } from '../utils/list-creatable-address-books'
import { resolveDefaultBookId } from '../utils/resolve-default-book'
import { routeParam } from '../utils/route-param'
import { useActiveAddressBookWritable } from './use-active-address-book'

export function useCreateContactAction(options?: {
  closeMobileSidebar?: boolean
}) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const routeBookId = routeParam(useParams().book_id) ?? null
  const isAllContacts = routeBookId === ALL_CONTACTS_BOOK_ID
  const { permissions } = useActiveAddressBookWritable()
  const rightsByBook = useAppSelector(selectRightsByBook)
  const { data: addressBooks, isLoading: isBooksLoading } =
    useGetAddressBooksQuery()
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const creatableBooks = useMemo(
    () => listCreatableAddressBooks(addressBooks, rightsByBook),
    [addressBooks, rightsByBook]
  )

  // The form lets the user pick the address book: the route book is only a
  // preselection, used when a contact can be created in it.
  const routeBookCreatable =
    routeBookId !== null && !isAllContacts && permissions.canCreate
  const targetBookId = routeBookCreatable
    ? routeBookId
    : resolveDefaultBookId(creatableBooks)
  const disabled = !routeBookCreatable && (isBooksLoading || !targetBookId)

  const onClick = useCallback(() => {
    if (disabled || !targetBookId) return
    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }
    dispatch(openCreateForm({ bookId: targetBookId }))
  }, [
    closeMobileSidebar,
    disabled,
    dispatch,
    isMobile,
    setOpenMobile,
    targetBookId,
  ])

  return {
    onClick,
    label: t('new_contact.string'),
    icon: UserPlus as LucideIcon,
    disabled,
  }
}
