import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

function TasksSidebarSkeleton() {
  const t = useTranslations('TASKS')

  return (
    <>
      <SidebarGroup className="px-2 pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel className="px-4">
          {t('sidebar.smart_views.title.string')}
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-1 px-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel className="px-4">
          {t('sidebar.calendars.title.string')}
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-1 px-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default memo(TasksSidebarSkeleton)
