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
  const t = useTranslations('Address_Books')
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <SidebarGroupAction title="Add Project">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="h-10 w-auto bg-secondary/10" />
          <Skeleton className="h-10 mt-2 w-auto bg-secondary/10" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>
          {t('sidebar.subscriptions.string')}
        </SidebarGroupLabel>
        <SidebarGroupAction title="Add Project">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="h-10 w-auto bg-secondary/10" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.globals.string')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <Skeleton className="h-10 w-auto bg-secondary/10" />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default SidebarSkeleton
