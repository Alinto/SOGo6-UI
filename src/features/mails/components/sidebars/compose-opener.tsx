import { SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useComposeAction } from '../../hooks/use-compose-action'

const ComposeOpener: React.FC = () => {
  const t = useTranslations('COMPOSE')
  const { onClick, icon: Icon } = useComposeAction()

  return (
    <SidebarMenuButton
      onClick={onClick}
      className="h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
    >
      <span className="sr-only">{t('new_message.string')}</span>
      <Icon className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
      <span className="truncate group-data-[collapsible=icon]:hidden">
        {t('new_message.string')}
      </span>
    </SidebarMenuButton>
  )
}

export default ComposeOpener
