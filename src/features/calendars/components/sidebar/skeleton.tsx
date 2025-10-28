import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

const SidebarSkeleton: React.FC = () => {
  const t = useTranslations('CALENDARS')
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <SidebarGroupAction title="Add Calendar">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.shared.string')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>
          {t('sidebar.subscriptions.string')}
        </SidebarGroupLabel>
        <SidebarGroupAction title="Add Calendar">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default SidebarSkeleton
