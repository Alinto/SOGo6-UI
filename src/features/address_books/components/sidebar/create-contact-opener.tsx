'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useCreateContactAction } from '../../hooks/use-create-contact-action'

function CreateContactOpener() {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { onClick, icon: Icon, disabled } = useCreateContactAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      disabled={disabled}
      tooltip={t('new_contact.string')}
      className="bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 hover:text-sidebar h-10 justify-center gap-2 rounded-lg border-2 border-transparent text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
      data-testid="create-contact-button"
    >
      <span className="sr-only">{t('new_contact.string')}</span>
      <Icon className="h-4 w-4 shrink-0 transition-transform" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_contact.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateContactOpener)
