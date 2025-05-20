import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Calendar, Contact2, Mail, Settings } from 'lucide-react'
import React from 'react'
import { Toggle } from '../toggle'

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
  if (firstPathPart === 'settings') {
    page = 'settings'
  }
  if (!isNaN(Number(firstPathPart))) {
    page = 'mail'
  }

  const { push } = useRouter()
  return (
    <div className={className}>
      <Toggle
        className="cursor-pointer"
        aria-label="Mail"
        size={'lg'}
        onClick={() => push('/0/inbox')}
        pressed={page === 'mail'}
      >
        <Mail className="h-7 w-7" />
      </Toggle>
      <Toggle
        className="cursor-pointer"
        aria-label="Address Books"
        size={'lg'}
        pressed={page === 'address_books'}
        onClick={() => push('/address_books')}
      >
        <Contact2 className="h-7 w-7" />
      </Toggle>
      <Toggle
        className="cursor-pointer"
        aria-label="Calendars"
        size={'lg'}
        pressed={page === 'calendars'}
        onClick={() => push('/calendars')}
      >
        <Calendar className="h-7 w-7" />
      </Toggle>
      <Toggle
        className="cursor-pointer"
        aria-label="Settings"
        size={'lg'}
        pressed={page === 'settings'}
        onClick={() => push('/settings')}
      >
        <Settings className="h-7 w-7" />
      </Toggle>
    </div>
  )
}

export default NavigationToggler
