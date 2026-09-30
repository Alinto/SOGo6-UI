'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useCreateEventAction } from '../../hooks/use-create-event-action'

const CreateEventOpener: React.FC = () => {
  const t = useTranslations('CALENDARS.toolbar')
  const { onClick, icon: Icon } = useCreateEventAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={t('createEvent.string')}
      className="bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 hover:text-sidebar h-10 justify-center gap-2 rounded-lg border-2 border-transparent text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
    >
      <span className="sr-only">{t('createEvent.string')}</span>
      <Icon className="h-4 w-4 shrink-0 transition-transform" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('createEvent.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateEventOpener)
