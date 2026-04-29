import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import React from 'react'
import SidebarsContent from './app-sidebar-content'

export function AppSidebar(): React.JSX.Element {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-29 rounded-br-2xl" />
      <SidebarContent
        className="scrollbar-thin-gray mt-1 overflow-y-auto p-0 pt-1 group-data-[state=collapsed]:overflow-visible [scrollbar-gutter:auto]!"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          scrollbarGutter: 'stable',
        }}
      >
        <SidebarsContent />
      </SidebarContent>
      <SidebarFooter className="flex justify-end p-0">
        <SidebarTrigger className="mb-2 ml-auto h-10 w-15 rounded-r-none" />
      </SidebarFooter>
    </Sidebar>
  )
}
