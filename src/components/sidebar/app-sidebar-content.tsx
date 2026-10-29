'use client'

import Sidebar from '@/features/address_books/components/sidebar/sidebar'
import AdminPanelSidebar from '@/features/admin-panel/components/sidebar/sidebar-content'
import CalendarsSidebar from '@/features/calendars/components/sidebar/sidebar'
import MailSidebar from '@/features/mails/components/sidebars/sidebar'
import { TasksSidebar } from '@/features/tasks'
import { useProfile } from '@/features/user-profile'
import type { SogoModule } from '@/features/user-profile/profile-types'
import UserSettingsSidebar from '@/features/user-settings/sidebar/sidebar-content'
import { usePathname } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'

const SidebarsContent = () => {
  const pathname = usePathname()
  const t = useTranslations('NAVIGATION')
  const { moduleAccess, isLoading } = useProfile()

  const firstSection = pathname.split('/')[1]
  const isAddressBooksSidebar = firstSection === 'address_books'
  const isAdminSidebar = firstSection === 'admin_panel'
  const isUserSettingsSidebar = firstSection === 'user_settings'
  const isCalendarsSidebar = firstSection === 'calendars'
  const isTasksSidebar = firstSection === 'tasks'
  const isMailSidebar = firstSection === 'u'

  // Fallback permissif : si loading ou liste vide, tout est autorisé
  const hasModuleAccess = (module: SogoModule): boolean => {
    if (isLoading || moduleAccess.length === 0) return true
    return moduleAccess.includes(module)
  }

  // Admin & user_settings ne sont pas soumis au filtre moduleAccess
  if (isAdminSidebar) {
    return (
      <nav aria-label={t('admin.string')}>
        <AdminPanelSidebar />
      </nav>
    )
  }
  if (isUserSettingsSidebar) {
    return (
      <nav aria-label={t('settings.string')}>
        <UserSettingsSidebar />
      </nav>
    )
  }

  if (isAddressBooksSidebar && hasModuleAccess('contact')) {
    return (
      <nav aria-label={t('address_book.string')}>
        <Sidebar />
      </nav>
    )
  }
  if (isCalendarsSidebar && hasModuleAccess('calendar')) {
    return (
      <nav aria-label={t('calendar.string')}>
        <CalendarsSidebar />
      </nav>
    )
  }
  if (isTasksSidebar) {
    return (
      <nav aria-label={t('tasks.string')}>
        <TasksSidebar />
      </nav>
    )
  }
  if (isMailSidebar && hasModuleAccess('mail')) {
    return (
      <nav aria-label={t('mail.string')}>
        <MailSidebar />
      </nav>
    )
  }

  return null
}

export default SidebarsContent
