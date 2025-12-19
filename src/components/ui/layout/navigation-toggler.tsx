import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Calendar, Contact2, Mail, NotepadText } from 'lucide-react'
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '../tabs'

interface NavigationTogglerProps {
  className?: string
}

const NavigationToggler: React.FC<NavigationTogglerProps> = ({
  className = '',
}) => {
  const pathname = usePathname()
  const firstPathPart = pathname.split('/')[1] || ''
  let page = ''

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

  const { push } = useRouter()
  return (
    <Tabs
      value={page}
      className={className}
      onValueChange={(value) => {
        if (value === 'mail') push('/u/0/INBOX')
        else if (value === 'address_books') push('/address_books')
        else if (value === 'calendars') push('/calendars')
        else if (value === 'tasks') push('/tasks')
      }}
    >
      <TabsList className="border-sidebar-foreground/20 bg-sidebar grid h-10 w-full grid-cols-4 border px-1 py-1">
        <TabsTrigger
          value="mail"
          aria-label="Mail"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <Mail className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="address_books"
          aria-label="Address Books"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <Contact2 className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="calendars"
          aria-label="Calendars"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <Calendar className="h-6 w-6" />
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          aria-label="Tasks"
          className="text-sidebar-foreground hover:text-foreground data-[state=active]:text-foreground cursor-pointer"
        >
          <NotepadText className="h-6 w-6" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default NavigationToggler
