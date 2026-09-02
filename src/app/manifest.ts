import { pwaStartUrl } from '@/features/offline/pwa-start-url'
import { getDefaultLocale } from '@/lib/i18n/config'
import type { MetadataRoute } from 'next'

const PWA_THEME_COLOR = '#3b6868'
const PWA_BACKGROUND_COLOR = '#1a1d23'

export default function manifest(): MetadataRoute.Manifest {
  const startUrl = pwaStartUrl()
  const locale = getDefaultLocale()

  return {
    name: 'SOGo',
    short_name: 'SOGo',
    description: 'SOGo Webmail',
    // Already-installed PWAs keep their original start_url until reinstall.
    // Locale prefix avoids the `/` → `/en` redirect, which fails offline.
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    lang: locale,
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Inbox',
        short_name: 'Inbox',
        url: startUrl,
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'New mail',
        short_name: 'Compose',
        url: `${startUrl}?compose=1`,
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
    share_target: {
      action: `/${locale}/share`,
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'files',
            accept: [
              'image/*',
              'text/plain',
              'text/html',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
          },
        ],
      },
    },
    protocol_handlers: [
      {
        protocol: 'mailto',
        url: `${startUrl}?compose=1&mailto=%s`,
      },
    ],
  } as MetadataRoute.Manifest
}
