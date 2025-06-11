'use client'
import { Search } from '@/features/mails/components/search'
import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'
import HeaderDropdown from './ui/header-dropdown'
import { HEADER_HEIGHT, SidebarTrigger } from './ui/sidebar'

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <header
      style={
        {
          '--header-height': HEADER_HEIGHT,
        } as React.CSSProperties
      }
      className="bg-header text-header-foreground top-0 right-0 left-0 z-10 flex shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
    >
      {isMobile && <SidebarTrigger />}
      <div className="ml-2 w-1/2 xl:w-1/3">
        <Search />
      </div>
      <div className="mr-3">
        <HeaderDropdown />
      </div>
    </header>
  )
}

export default AppHeader
