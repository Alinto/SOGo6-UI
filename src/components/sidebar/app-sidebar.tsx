import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useExpandSidebarOnMailDrag } from '@/features/mails/hooks/use-expand-sidebar-on-mail-drag'

import React from 'react'
import SidebarsContent from './app-sidebar-content'
import { AppSidebarMobileEffects } from './app-sidebar-mobile-effects'

export function AppSidebar(): React.JSX.Element {
  useExpandSidebarOnMailDrag()

  return (
    <Sidebar collapsible="icon">
      <AppSidebarMobileEffects />
      <SidebarHeader className="flex h-29 rounded-br-2xl" />
      <SidebarContent
        className="scrollbar-thin-gray mt-1 overflow-y-auto p-0 pt-1 [scrollbar-gutter:auto]! group-data-[state=collapsed]:overflow-visible"
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
