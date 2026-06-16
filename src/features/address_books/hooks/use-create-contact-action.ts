'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { UserPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { openCreateForm } from '../store/address-books-ui-slice'

export function useCreateContactAction(options?: {
  closeMobileSidebar?: boolean
}) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const { book_id } = useParams()
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const onClick = useCallback(() => {
    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }
    dispatch(
      openCreateForm({
        bookId: typeof book_id === 'string' ? book_id : undefined,
      })
    )
  }, [book_id, closeMobileSidebar, dispatch, isMobile, setOpenMobile])

  return {
    onClick,
    label: t('new_contact.string'),
    icon: UserPlus as LucideIcon,
  }
}
