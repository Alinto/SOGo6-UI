'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { useCreateEventAction } from '../../hooks/use-create-event-action'

const CreateEventOpener: React.FC = () => {
  const t = useTranslations('CALENDARS.toolbar')
  const { onClick, icon: Icon } = useCreateEventAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
    >
      <span className="sr-only">{t('createEvent.string')}</span>
      <Icon className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('createEvent.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateEventOpener)
