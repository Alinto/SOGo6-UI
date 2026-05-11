'use client'

import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { CalendarPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { requestCreateEvent } from '../../store/calendar-ui-slice'

const CreateEventOpener: React.FC = () => {
  const t = useTranslations('CALENDARS.toolbar')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()

  const handleCreateEvent = () => {
    if (isMobile) {
      setOpenMobile(false)
    }

    dispatch(requestCreateEvent())
  }

  return (
    <SidebarMenuButton
      onClick={handleCreateEvent}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
    >
      <span className="sr-only">{t('createEvent.string')}</span>
      <CalendarPlus className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('createEvent.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateEventOpener)
