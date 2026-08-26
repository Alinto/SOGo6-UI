import { shouldSkipDocumentNav } from '@/features/offline/network/skip-document-nav'
import { useNetworkStatus } from '@/features/offline/network/use-network-status'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { ModuleNavIcon } from '@/lib/icons/module-nav-icons'
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '../tabs'

interface NavigationTogglerProps {
  className?: string
}

const MODULE_HREF: Record<string, string> = {
  address_books: '/address_books',
  calendars: '/calendars',
  tasks: '/tasks',
}

const NavigationToggler: React.FC<NavigationTogglerProps> = ({
  className = '',
}) => {
  const pathname = usePathname()
  const firstPathPart = pathname.split('/')[1] || ''
  let page = ''

  const { view, navigateApp, closeOverlay } = useOfflineNav()
  const { isOnline, isProbing } = useNetworkStatus()
  const skipNav = shouldSkipDocumentNav(isOnline, isProbing)

  if (firstPathPart === 'address_books') {
    page = 'address_books'
  }
  if (firstPathPart === 'calendars') {
    page = 'calendars'
  }
  if (firstPathPart === 'tasks') {
    page = 'tasks'
  }
  if (firstPathPart === 'u') {
    page = 'mail'
  }
  if (view.kind === 'unavailable') {
    if (view.target === 'contacts') page = 'address_books'
    else if (view.target === 'calendar') page = 'calendars'
    else if (view.target === 'tasks') page = 'tasks'
  }

  const { push } = useRouter()
  return (
    <Tabs
      activationMode="manual"
      value={page}
      className={className}
      onValueChange={(value) => {
        if (value === 'mail') {
          if (skipNav) {
            closeOverlay()
            return
          }
          push('/u/0/INBOX')
          return
        }
        const href = MODULE_HREF[value]
        if (href) navigateApp(href)
      }}
    >
      <TabsList className="border-sidebar-foreground/20 bg-sidebar grid h-10 w-full grid-cols-4 border px-1 py-1">
        <TabsTrigger
          value="mail"
          aria-label="Mail"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <ModuleNavIcon.Mail className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="address_books"
          aria-label="Address Books"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <ModuleNavIcon.AddressBook className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="calendars"
          aria-label="Calendars"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <ModuleNavIcon.Calendar className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          aria-label="Tasks"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <ModuleNavIcon.Tasks className="h-6 w-6" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default NavigationToggler
