import { pwaStartUrl } from '@/features/offline/pwa-start-url'
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const startUrl = pwaStartUrl()

  return {
    name: 'SOGo',
    short_name: 'SOGo',
    description: 'SOGo Webmail',
    // Already-installed PWAs keep their original start_url until reinstall.
    // Locale prefix avoids the `/` → `/en` redirect, which fails offline.
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a56db',
    lang: 'en',
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
  }
}
