import {
  Calendar,
  Contact,
  Mail,
  SettingsIcon,
  ShieldUser,
  User,
  UserCog,
} from 'lucide-react'

const navItems = [
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
      {
        title: 'US_SIDEBAR.account.security.string',
        url: '/user_settings/security',
        icon: ShieldUser,
      },
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
            url: '/user_settings/calendars/genreral',
          },
          {
            title: 'US_SIDEBAR.settings.calendars.categories.string',
            url: '/user_settings/calendars/categories',
          },
          {
            title: 'US_SIDEBAR.settings.calendars.invitations.string',
            url: '/user_settings/calendars/invitations',
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
            title: 'US_SIDEBAR.settings.email.labels.string',
            url: '/user_settings/mail/labels',
          },
          {
            title: 'US_SIDEBAR.settings.email.imap_accounts.string',
            url: '/user_settings/mail/imap_accounts',
          },
          {
            title: 'US_SIDEBAR.settings.email.filters.string',
            url: '/user_settings/mail/filters',
          },
          {
            title: 'US_SIDEBAR.settings.email.vacation.string',
            url: '/user_settings/mail/vacation',
          },
          {
            title: 'US_SIDEBAR.settings.email.forward.string',
            url: '/user_settings/mail/forward',
          },
          {
            title: 'US_SIDEBAR.settings.email.notifications.string',
            url: '/user_settings/mail/notifications',
          },
        ],
      },
    ],
  },
]

export default navItems
