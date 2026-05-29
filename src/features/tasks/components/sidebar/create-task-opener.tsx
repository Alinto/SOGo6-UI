'use client'

import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { openCreateForm } from '../../store/tasks-ui-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { ListPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

function CreateTaskOpener() {
  const t = useTranslations('TASKS')
  const { isMobile, setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    dispatch(openCreateForm())
  }

  return (
    <SidebarMenuButton
      onClick={handleClick}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
    >
      <span className="sr-only">{t('new_task.string')}</span>
      <ListPlus className="hidden h-5 w-5 group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_task.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateTaskOpener)
