import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useComposeAction } from '../../hooks/use-compose-action'

const ComposeOpener: React.FC = () => {
  const t = useTranslations('COMPOSE')
  const { onClick, icon: Icon } = useComposeAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={t('new_message.string')}
      className="bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 hover:text-sidebar h-14 justify-center gap-2 rounded-lg border-2 border-transparent text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
    >
      <span className="sr-only">{t('new_message.string')}</span>
      <Icon className="h-5 w-5 shrink-0 transition-transform" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_message.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default ComposeOpener
