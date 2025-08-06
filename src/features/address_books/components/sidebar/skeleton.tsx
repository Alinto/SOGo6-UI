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
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t('personals.string')}</SidebarGroupLabel>
        <SidebarGroupAction title="Add Project">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t('subscriptions.string')}</SidebarGroupLabel>
        <SidebarGroupAction title="Add Project">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t('globals.string')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default SidebarSkeleton
