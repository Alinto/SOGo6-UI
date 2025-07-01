import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const SidebarSkeleton: React.FC = () => {
  return (
    <>
      <SidebarGroup className="py-0 pr-0 group-data-[collapsible=icon]:p-0">
        <Skeleton className="bg-secondary/10 h-10 w-full rounded-md" />
      </SidebarGroup>
      <SidebarGroup className="py-0 pr-0 group-data-[collapsible=icon]:p-0">
        <Skeleton className="bg-secondary/10 h-10 w-full rounded-md" />
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <Skeleton className="bg-secondary/10 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
          <Skeleton className="bg-secondary/10 mt-2 h-10 w-auto" />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default SidebarSkeleton
