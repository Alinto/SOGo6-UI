'use client'

import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { memo } from 'react'
import { openCreateForm } from '../../store/address-books-ui-slice'

function CreateContactOpener() {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const { book_id } = useParams()

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    dispatch(
      openCreateForm({
        bookId: typeof book_id === 'string' ? book_id : undefined,
      })
    )
  }

  return (
    <SidebarMenuButton
      onClick={handleClick}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
      data-testid="create-contact-button"
    >
      <span className="sr-only">{t('new_contact.string')}</span>
      <UserPlus className="hidden h-5 w-5 group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_contact.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateContactOpener)
