'use client'
import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'
import HeaderDate from './ui/header-date'
import HeaderDropdown from './ui/header-dropdown'
import { SidebarTrigger } from './ui/sidebar'

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile()
  return (
    <header className="top-0 left-0 right-0 flex h-13 shrink-0 items-center justify-between bg-header gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      {!isMobile ? (
        <div className="flex items-center gap-2 px-4">
          <HeaderDate />
        </div>
      ) : (
        <SidebarTrigger />
      )}
      <div className="mr-3">
        <HeaderDropdown />
      </div>
    </header>
  )
}

export default AppHeader
