import {
  Calendar,
  Contact,
  Mail,
  Settings,
  ShieldUser,
  User,
  UserCog,
} from 'lucide-react'

const navItems = [
  {
    title: 'account.title',
    isActive: true,
    items: [
      {
        title: 'account.profile',
        url: '/user_settings/profile',
        icon: User,
      },
      {
        title: 'account.security',
        url: '/user_settings/security',
        icon: ShieldUser,
      },
    ],
  },
  {
    title: 'settings.title',
    isActive: true,
    items: [
      {
        title: 'settings.general',
        url: '/user_settings/general',
        icon: UserCog,
      },
      {
        title: 'settings.address_books',
        url: '/user_settings/address_books',
        icon: Contact,
      },
      {
        title: 'settings.calendars.title',
        icon: Calendar,
        isActive: true,
        items: [
          {
            title: 'settings.calendars.general',
            url: '/user_settings/calendars/general',
          },
          {
            title: 'settings.calendars.categories',
            url: '/user_settings/calendars/categories',
          },
          {
            title: 'settings.calendars.invitations',
            url: '/user_settings/calendars/invitations',
          },
        ],
      },
      {
        title: 'settings.email.title',
        icon: Mail,
        isActive: true,
        items: [
          {
            title: 'settings.email.general',
            url: '/user_settings/mail/general',
          },
          {
            title: 'settings.email.labels',
            url: '/user_settings/mail/labels',
          },
          {
            title: 'settings.email.imap_accounts',
            url: '/user_settings/mail/imap_accounts',
          },
          {
            title: 'settings.email.filters',
            url: '/user_settings/mail/filters',
          },
          {
            title: 'settings.email.vacation',
            url: '/user_settings/mail/vacation',
          },
          {
            title: 'settings.email.forward',
            url: '/user_settings/mail/forward',
          },
        ],
      },
    ],
  },
  {
    title: 'administration.title',
    items: [
      {
        title: 'administration.panel',
        url: '/admin/panel',
        icon: Settings,
      },
    ],
  },
]

export default navItems
