'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useAppDispatch } from '@/lib/redux/hooks'
import { CalendarPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { requestCreateEvent } from '../store/calendar-ui-slice'

export function useCreateEventAction(options?: { closeMobileSidebar?: boolean }) {
  const t = useTranslations('CALENDARS.toolbar')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const onClick = useCallback(() => {
    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }

    dispatch(requestCreateEvent())
  }, [closeMobileSidebar, dispatch, isMobile, setOpenMobile])

  return {
    onClick,
    label: t('createEvent.string'),
    icon: CalendarPlus as LucideIcon,
  }
}
