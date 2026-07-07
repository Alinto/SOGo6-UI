'use client'

import { useProfile } from '@/features/user-profile'
import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Contact,
  Mail,
  SettingsIcon,
  ShieldUser,
  User,
  UserCog,
} from 'lucide-react'
import { useMemo } from 'react'

interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  collapsedIcon?: LucideIcon
  isActive?: boolean
  items?: NavItem[]
}

const when = (condition: boolean, item: NavItem): NavItem[] =>
  condition ? [item] : []

export function useNavItems(): NavItem[] {
  const {
    forwardEnabled,
    vacationEnabled,
    mailFilteringEnabled,
    notifyEnabled,
    passwordChangeEnabled,
  } = useProfile()

  return useMemo(
    () => [
      {
        title: 'US_SIDEBAR.account.title.string',
        isActive: true,
        collapsedIcon: User,
        items: [
          {
            title: 'US_SIDEBAR.account.profile.string',
            url: '/user_settings/profile',
            icon: User,
          },
          ...when(passwordChangeEnabled, {
            title: 'US_SIDEBAR.account.security.string',
            url: '/user_settings/security',
            icon: ShieldUser,
          }),
        ],
      },
      {
        title: 'US_SIDEBAR.settings.title.string',
        isActive: true,
        collapsedIcon: SettingsIcon,
        items: [
          {
            title: 'US_SIDEBAR.settings.general.string',
            url: '/user_settings/general',
            icon: UserCog,
            collapsedIcon: UserCog,
          },
          {
            title: 'US_SIDEBAR.settings.address_books.string',
            url: '/user_settings/address_books',
            icon: Contact,
          },
          {
            title: 'US_SIDEBAR.settings.calendars.title.string',
            icon: Calendar,
            collapsedIcon: Calendar,
            isActive: true,
            items: [
              {
                title: 'US_SIDEBAR.settings.calendars.general.string',
                url: '/user_settings/calendars/general',
              },
              {
                title: 'US_SIDEBAR.settings.calendars.categories.string',
                url: '/user_settings/calendars/categories',
              },
            ],
          },
          {
            title: 'US_SIDEBAR.settings.email.title.string',
            icon: Mail,
            collapsedIcon: Mail,
            isActive: true,
            items: [
              {
                title: 'US_SIDEBAR.settings.email.general.string',
                url: '/user_settings/mail/general',
              },
              {
                title: 'US_SIDEBAR.settings.email.categories.string',
                url: '/user_settings/mail/categories',
              },
              {
                title: 'US_SIDEBAR.settings.email.external_accounts.string',
                url: '/user_settings/mail/external_accounts',
              },
              ...when(mailFilteringEnabled, {
                title: 'US_SIDEBAR.settings.email.filters.string',
                url: '/user_settings/mail/filters',
              }),
              ...when(vacationEnabled, {
                title: 'US_SIDEBAR.settings.email.vacation.string',
                url: '/user_settings/mail/vacation',
              }),
              ...when(forwardEnabled, {
                title: 'US_SIDEBAR.settings.email.forward.string',
                url: '/user_settings/mail/forward',
              }),
              ...when(notifyEnabled, {
                title: 'US_SIDEBAR.settings.email.notifications.string',
                url: '/user_settings/mail/notifications',
              }),
            ],
          },
        ],
      },
    ],
    [
      forwardEnabled,
      vacationEnabled,
      mailFilteringEnabled,
      notifyEnabled,
      passwordChangeEnabled,
    ]
  )
}
