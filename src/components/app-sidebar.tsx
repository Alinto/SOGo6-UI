import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'

import Image from 'next/image'
import React from 'react'

export function AppSidebar({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Sidebar>
      <SidebarHeader className="flex h-20">
        <div className="flex justify-center pl-4 pt-3 gap-4 space-x-2">
          <Image
            alt="App Logo"
            src="/images/sogo-full-alt.png"
            width={100}
            height={50}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-5 pl-3">{children}</SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
