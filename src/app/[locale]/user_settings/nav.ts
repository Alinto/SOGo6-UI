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
    title: 'account.title.string',
    isActive: true,
    items: [
      {
        title: 'account.profile.string',
        url: '/user_settings/profile',
        icon: User,
      },
      {
        title: 'account.security.string',
        url: '/user_settings/security',
        icon: ShieldUser,
      },
    ],
  },
  {
    title: 'settings.title.string',
    isActive: true,
    items: [
      {
        title: 'settings.general.string',
        url: '/user_settings/general',
        icon: UserCog,
      },
      {
        title: 'settings.address_books.string',
        url: '/user_settings/address_books',
        icon: Contact,
      },
      {
        title: 'settings.calendars.title.string',
        icon: Calendar,
        isActive: true,
        items: [
          {
            title: 'settings.calendars.general.string',
            url: '/user_settings/calendars/general',
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
