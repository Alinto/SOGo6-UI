'use client'

import Sidebar from '@/features/address_books/components/sidebar/sidebar'
import MailSidebar from '@/features/mails/components/sidebars/sidebar'
import UserSettingsSidebar from '@/features/user-settings/components/sidebar/sidebar-content'

import { usePathname } from '@/lib/i18n/navigation'

const SidebarsContent = () => {
  const pathname = usePathname()

  const firstSection = pathname.split('/')[1]
  const isAddressBooksSidebar = firstSection === 'address_books'
  const isUserSettingsSidebar = firstSection === 'user_settings'
  const isCalendarsSidebar = firstSection === 'calendars'
  const isMailSidebar = firstSection === 'u'

  if (isAddressBooksSidebar) {
    return <Sidebar />
  }
  if (isUserSettingsSidebar) {
    return <UserSettingsSidebar />
  }
  if (isCalendarsSidebar) {
    return <div>Calendars Sidebar</div>
  }
  if (isMailSidebar) {
    return <MailSidebar />
  }

  return null
}

export default SidebarsContent
