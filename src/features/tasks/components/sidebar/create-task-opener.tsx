'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useCreateTaskAction } from '../../hooks/use-create-task-action'

function CreateTaskOpener() {
  const t = useTranslations('TASKS')
  const { onClick, icon: Icon } = useCreateTaskAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      className={cn(
        'h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'
      )}
    >
      <span className="sr-only">{t('new_task.string')}</span>
      <Icon className="hidden h-5 w-5 group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_task.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateTaskOpener)
