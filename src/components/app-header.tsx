'use client'
import CalendarEventsSearch from '@/features/calendars/components/calendar-events-search'
import MailsSearch from '@/features/mails/components/mails-search'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import React, { memo } from 'react'
import HeaderDropdown from './ui/header-dropdown'
import { SidebarTrigger } from './ui/sidebar'

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const showMailSearch = pathname.startsWith('/u/')
  const showAddressBookSearch = pathname.startsWith('/address-books/')
  const showCalendarsSearch = pathname.startsWith('/calendars')

  return (
    <header className="bg-header text-header-foreground top-0 right-0 left-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div
        className={cn('flex items-center gap-2 ml-3', isMobile ? 'w-full' : 'w-1/2')}
      >
        {isMobile && <SidebarTrigger />}
        <div className="min-w-0 flex-1">
          {showMailSearch && <MailsSearch />}
          {showCalendarsSearch && <CalendarEventsSearch />}
        </div>
      </div>
      {showAddressBookSearch && (
        <div className="ml-2 w-1/4 min-w-0 flex-1">{/* address book search */}</div>
      )}
      {!showMailSearch && !showAddressBookSearch && !showCalendarsSearch && (
        <div className="ml-2 min-w-0 flex-1"></div>
      )}
      <div className="mr-3 shrink-0">
        <HeaderDropdown />
      </div>
    </header>
  )
}

export default memo(AppHeader, (prev, next) => prev === next)
