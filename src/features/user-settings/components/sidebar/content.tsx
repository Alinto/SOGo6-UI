import {
  Calendar,
  Contact,
  Mail,
  Settings,
  SettingsIcon,
  ShieldUser,
  User,
  UserCog,
} from 'lucide-react'
import translationMapping from './translation-mapping'

const navItems = [
  {
    title: 'account.title.string',
    isActive: true,
    collapsedIcon: User,
    items: [
      {
        title: translationMapping.profile,
        url: '/user_settings/profile',
        icon: User,
      },
      {
        title: translationMapping.security,
        url: '/user_settings/security',
        icon: ShieldUser,
      },
    ],
  },
  {
    title: translationMapping.settings_title,
    isActive: true,
    collapsedIcon: SettingsIcon,
    items: [
      {
        title: translationMapping.settings_general,
        url: '/user_settings/general',
        icon: UserCog,
        collapsedIcon: UserCog,
      },
      {
        title: translationMapping.settings_address_books,
        url: '/user_settings/address_books',
        icon: Contact,
      },
      {
        title: translationMapping.settings_calendars_title,
        icon: Calendar,
        collapsedIcon: Calendar,
        isActive: true,
        items: [
          {
            title: 'settings.calendars.general.string',
            url: '/user_settings/calendars/genreral',
          },
          {
            title: 'settings.calendars.categories.string',
            url: '/user_settings/calendars/categories',
          },
          {
            title: 'settings.calendars.invitations.string',
            url: '/user_settings/calendars/invitations',
          },
        ],
      },
      {
        title: 'settings.email.title.string',
        icon: Mail,
        collapsedIcon: Mail,
        isActive: true,
        items: [
          {
            title: 'settings.email.general.string',
            url: '/user_settings/mail/general',
          },
          {
            title: 'settings.email.labels.string',
            url: '/user_settings/mail/labels',
          },
          {
            title: 'settings.email.imap_accounts.string',
            url: '/user_settings/mail/imap_accounts',
          },
          {
            title: 'settings.email.filters.string',
            url: '/user_settings/mail/filters',
          },
          {
            title: 'settings.email.vacation.string',
            url: '/user_settings/mail/vacation',
          },
          {
            title: 'settings.email.forward.string',
            url: '/user_settings/mail/forward',
          },
          {
            title: 'settings.email.notifications.string',
            url: '/user_settings/mail/notifications',
          },
        ],
      },
    ],
  },
  {
    title: 'administration.title.string',
    items: [
      {
        title: 'administration.panel.string',
        url: '/admin/panel',
        icon: Settings,
      },
    ],
  },
]

export default navItems
