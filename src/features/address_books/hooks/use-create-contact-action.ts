'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { UserPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { useGetAddressBooksQuery } from '../store/address-books-api'
import { openCreateForm } from '../store/address-books-ui-slice'
import { getAddressBookPermissions } from '../utils/address-book-permissions'
import { resolveDefaultBookId } from '../utils/resolve-default-book'
import { useActiveAddressBookWritable } from './use-active-address-book'

export function useCreateContactAction(options?: {
  closeMobileSidebar?: boolean
}) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const { book_id: rawBookId } = useParams()
  const routeBookId = typeof rawBookId === 'string' ? rawBookId : null
  const hasRouteBook = routeBookId !== null
  const isAllContacts = routeBookId === ALL_CONTACTS_BOOK_ID
  const { permissions } = useActiveAddressBookWritable()
  const { data: addressBooks, isLoading: isBooksLoading } =
    useGetAddressBooksQuery(undefined, { skip: hasRouteBook })
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const defaultBookId = useMemo(
    () => resolveDefaultBookId(addressBooks?.personals ?? []),
    [addressBooks?.personals]
  )
  const defaultBook =
    addressBooks?.personals.find((book) => book.id === defaultBookId) ?? null
  const canCreateInDefaultBook =
    getAddressBookPermissions(defaultBook).canCreate

  const targetBookId = hasRouteBook ? routeBookId : defaultBookId
  const disabled = hasRouteBook
    ? isAllContacts || !permissions.canCreate
    : isBooksLoading || !canCreateInDefaultBook

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
