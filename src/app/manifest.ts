import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SOGo - Groupware',
    short_name: 'SOGo',
    description: 'Modern web-based groupware with email, calendar, and contacts',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/images/sogo-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/sogo-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/sogo-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/sogo-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Inbox',
        short_name: 'Inbox',
        description: 'Open your inbox',
        url: '/u/inbox',
        icons: [
          {
            src: '/images/sogo-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Calendar',
        short_name: 'Calendar',
        description: 'View your calendar',
        url: '/calendars',
        icons: [
          {
            src: '/images/sogo-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Contacts',
        short_name: 'Contacts',
        description: 'View your contacts',
        url: '/address-books',
        icons: [
          {
            src: '/images/sogo-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
  }
}
