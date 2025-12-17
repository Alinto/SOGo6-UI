'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import type { AdminPanelTabsProps } from '../../types/form'

export default function AdminPanelTabs({
  tabNames,
  activeTab,
  onTabChange,
}: AdminPanelTabsProps) {
  const t = useTranslations('AP_DOMAIN_CONFIGURATION')
  const findTabName = (name: string) => {
    switch (name) {
      case 'AUTH_SETTINGS':
        return t('tabs.auth_settings.string')
      case 'USER_SOURCE':
        return t('tabs.user_source.string')
      case 'USER_MODULE_SETTINGS':
        return t('tabs.user_module_settings.string')
      case 'MAIL_SETTINGS':
        return t('tabs.mail_settings.string')
      case 'CALENDAR_CONTACT_SETTINGS':
        return t('tabs.calendar_contact_settings.string')
      default:
        return name
    }
  }
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-muted/30 mb-1 inline-flex w-auto border p-1">
        {tabNames.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="data-[state=active]:text-primary hover:bg-secondary cursor-pointer px-3 py-1 transition data-[state=active]:border"
          >
            {findTabName(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
