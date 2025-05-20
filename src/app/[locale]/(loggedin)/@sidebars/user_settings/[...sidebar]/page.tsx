import { NavBar } from '@/components/nav-bar'
import navItems from '@/features/user-settings/sidebar/nav'
import React from 'react'

const UserSettingsSidebar: React.FC = () => {
  return (
    <NavBar
      key={'user_settings_sidebar'}
      items={navItems}
      translationsKey="Nav_Settings"
    />
  )
}

export default UserSettingsSidebar
