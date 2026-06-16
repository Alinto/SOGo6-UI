'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { openCreateForm } from '../store/tasks-ui-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { ListPlus, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

export function useCreateTaskAction(options?: { closeMobileSidebar?: boolean }) {
  const t = useTranslations('TASKS')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const onClick = useCallback(() => {
    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }
    dispatch(openCreateForm())
  }, [closeMobileSidebar, dispatch, isMobile, setOpenMobile])

  return {
    onClick,
    label: t('new_task.string'),
    icon: ListPlus as LucideIcon,
  }
}
