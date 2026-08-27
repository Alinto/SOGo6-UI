'use client'
import ContactsSearch from '@/features/address_books/components/contacts-search'
import CalendarEventsSearch from '@/features/calendars/components/calendar-events-search'
import MailsSearch from '@/features/mails/components/mails-search'
import {
  isNonMailModuleOverlay,
  type OfflineUnavailableTarget,
} from '@/features/offline/offline-modules'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import TasksSearch from '@/features/tasks/components/tasks-search'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import HeaderDropdown from './ui/header-dropdown'
import { SidebarTrigger } from './ui/sidebar'

function overlayTitleForTarget(
  t: (key: string) => string,
  target: OfflineUnavailableTarget
): string | null {
  if (target === 'calendar') return t('offline_module_calendar.string')
  if (target === 'contacts') return t('offline_module_contacts.string')
  if (target === 'tasks') return t('offline_module_tasks.string')
  if (target === 'settings') return t('offline_module_settings.string')
  if (target === 'notes') return t('offline_module_notes.string')
  return null
}

const AppHeader: React.FC = () => {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const t = useTranslations('PWA')
  const { view } = useOfflineNav()
  const moduleOverlay = isNonMailModuleOverlay(
    view.kind,
    view.kind === 'unavailable' ? view.target : undefined
  )
  const overlayTitle =
    moduleOverlay && view.kind === 'unavailable'
      ? overlayTitleForTarget(t, view.target)
      : null

  const showMailSearch = pathname.startsWith('/u/') && !moduleOverlay
  const showAddressBookSearch =
    pathname.startsWith('/address_books') && !moduleOverlay
  const showCalendarsSearch =
    pathname.startsWith('/calendars') && !moduleOverlay
  const showTasksSearch = pathname.startsWith('/tasks') && !moduleOverlay

  return (
    <header className="bg-header text-header-foreground top-0 right-0 left-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div
        className={cn(
          'ml-3 flex items-center gap-2',
          isMobile ? 'w-full' : 'w-1/2'
        )}
      >
        {isMobile && <SidebarTrigger />}
        <div className="min-w-0 flex-1">
          {overlayTitle ? (
            <p className="truncate text-sm font-medium">{overlayTitle}</p>
          ) : (
            <>
              {showMailSearch && <MailsSearch />}
              {showAddressBookSearch && <ContactsSearch />}
              {showCalendarsSearch && <CalendarEventsSearch />}
              {showTasksSearch && <TasksSearch />}
            </>
          )}
        </div>
      </div>
      {!overlayTitle &&
        !showMailSearch &&
        !showAddressBookSearch &&
        !showCalendarsSearch &&
        !showTasksSearch && <div className="ml-2 min-w-0 flex-1" />}
      <div className="mr-3 shrink-0">
        <HeaderDropdown />
      </div>
    </header>
  )
}

export default memo(AppHeader, (prev, next) => prev === next)
