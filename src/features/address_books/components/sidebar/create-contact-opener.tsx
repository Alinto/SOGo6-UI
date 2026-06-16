'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useCreateContactAction } from '../../hooks/use-create-contact-action'

function CreateContactOpener() {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { onClick, icon: Icon } = useCreateContactAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
      data-testid="create-contact-button"
    >
      <span className="sr-only">{t('new_contact.string')}</span>
      <Icon className="hidden h-5 w-5 group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_contact.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateContactOpener)
