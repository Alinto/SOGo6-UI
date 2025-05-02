import { SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import HeaderDropdown from './ui/header-dropdown'

const AppHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex h-20 shrink-0 items-center justify-between bg-header gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 text-background" />
        <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="mr-3">
        <HeaderDropdown />
      </div>
    </header>
  )
}

export default AppHeader
