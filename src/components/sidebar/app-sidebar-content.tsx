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
import type { ReactNode } from 'react'

/**
 * Navigation of a module whose collapsed sidebar is an icon rail. Collapsed, it
 * fills the sidebar height, so the rail can measure the room it has above the
 * footer. It takes the focus when the rail's "+N" entry expands the sidebar.
 */
function IconRailNav({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <nav
      aria-label={label}
      tabIndex={-1}
      className="outline-hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:flex-1 group-data-[collapsible=icon]:flex-col"
    >
      {children}
    </nav>
  )
}

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
      <IconRailNav label={t('address_book.string')}>
        <Sidebar />
      </IconRailNav>
    )
  }
  if (isCalendarsSidebar && hasModuleAccess('calendar')) {
    return (
      <IconRailNav label={t('calendar.string')}>
        <CalendarsSidebar />
      </IconRailNav>
    )
  }
  if (isTasksSidebar) {
    return (
      <IconRailNav label={t('tasks.string')}>
        <TasksSidebar />
      </IconRailNav>
    )
  }
  if (isMailSidebar && hasModuleAccess('mail')) {
    return (
      <IconRailNav label={t('mail.string')}>
        <MailSidebar />
      </IconRailNav>
    )
  }

  return null
}

export default SidebarsContent
