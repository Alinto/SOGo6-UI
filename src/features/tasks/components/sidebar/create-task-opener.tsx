'use client'

import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import { useCreateTaskAction } from '../../hooks/use-create-task-action'

function CreateTaskOpener() {
  const t = useTranslations('TASKS')
  const { onClick, icon: Icon } = useCreateTaskAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={t('new_task.string')}
      className="bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 hover:text-sidebar h-10 justify-center gap-2 rounded-lg border-2 border-transparent text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
    >
      <span className="sr-only">{t('new_task.string')}</span>
      <Icon className="h-4 w-4 shrink-0 transition-transform" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_task.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default memo(CreateTaskOpener)
