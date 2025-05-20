import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import React from 'react'

export function AppSidebar({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-29 rounded-br-2xl" />
      <SidebarContent
        className="group-data-[state=collapsed]:overflow-visible"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          scrollbarGutter: 'stable',
        }}
      >
        {children}
      </SidebarContent>
      <SidebarFooter className="flex justify-end p-0">
        <SidebarTrigger className="ml-auto h-10 w-15 mb-2 rounded-r-none" />
      </SidebarFooter>
    </Sidebar>
  )
}
