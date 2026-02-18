'use client'

import Sidebar from '@/features/address_books/components/sidebar/sidebar'
import AdminPanelSidebar from '@/features/admin-panel/components/sidebar/sidebar-content'
import CalendarsSidebar from '@/features/calendars/components/sidebar/sidebar'
import MailSidebar from '@/features/mails/components/sidebars/sidebar'
import { useProfile } from '@/features/user-profile'
import UserSettingsSidebar from '@/features/user-settings/sidebar/sidebar-content'
import { usePathname } from '@/lib/i18n/navigation'

const SidebarsContent = () => {
  const pathname = usePathname()
  const { moduleAccess, isLoading } = useProfile()

  const firstSection = pathname.split('/')[1]
  const isAddressBooksSidebar = firstSection === 'address_books'
  const isAdminSidebar = firstSection === 'admin_panel'
  const isUserSettingsSidebar = firstSection === 'user_settings'
  const isCalendarsSidebar = firstSection === 'calendars'
  const isMailSidebar = firstSection === 'u'

  // Fallback permissif : si loading ou liste vide, tout est autorisé
  const hasModuleAccess = (module: string): boolean => {
    if (isLoading || moduleAccess.length === 0) return true
    return moduleAccess.includes(module)
  }

  // Admin & user_settings ne sont pas soumis au filtre moduleAccess
  if (isAdminSidebar) {
    return <AdminPanelSidebar />
  }
  if (isUserSettingsSidebar) {
    return <UserSettingsSidebar />
  }

  if (isAddressBooksSidebar && hasModuleAccess('contact')) {
    return <Sidebar />
  }
  if (isCalendarsSidebar && hasModuleAccess('calendar')) {
    return <CalendarsSidebar />
  }
  if (isMailSidebar && hasModuleAccess('mail')) {
    return <MailSidebar />
  }

  return null
}

export default SidebarsContent
