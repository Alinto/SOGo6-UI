/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
} from 'serwist'
import { filterPrecacheEntries, isNavigationRequest } from './sw-runtime'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const OUTBOX_FLUSH_SYNC_TAG = 'outbox-flush'

const expire = (maxEntries: number, maxAgeSeconds: number) =>
  new ExpirationPlugin({ maxEntries, maxAgeSeconds })

const serwist = new Serwist({
  precacheEntries: filterPrecacheEntries(self.__SW_MANIFEST),
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /\/(?:api|fakeApi)\//i,
      handler: new NetworkOnly(),
    },
    {
      matcher: /ckeditor5|ck-editor|ckeditor/i,
      handler: new CacheFirst({
        cacheName: 'ckeditor-assets',
        plugins: [expire(64, 30 * 24 * 60 * 60)],
      }),
    },
    {
      matcher: ({ request }) => isNavigationRequest(request),
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        plugins: [expire(32, 24 * 60 * 60)],
      }),
    },
    {
      matcher: /\/_next\/static\//,
      handler: new CacheFirst({
        cacheName: 'next-static',
        plugins: [expire(128, 7 * 24 * 60 * 60)],
      }),
    },
    {
      matcher: /\/(?:icons|images)\//,
      handler: new CacheFirst({
        cacheName: 'static-images',
        plugins: [expire(64, 30 * 24 * 60 * 60)],
      }),
    },
    {
      matcher: /\/manifest\.webmanifest/,
      handler: new NetworkFirst({
        cacheName: 'manifest',
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: /\/env\?probe=/,
      handler: new NetworkOnly(),
    },
    {
      matcher: /\/env(?:\?|$)/,
      handler: new NetworkFirst({
        cacheName: 'env',
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: /.*/i,
      method: 'GET',
      handler: new NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 3,
        plugins: [expire(64, 24 * 60 * 60)],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return isNavigationRequest(request)
        },
      },
    ],
  },
})

serwist.addEventListeners()

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

self.addEventListener('sync', ((event: Event) => {
  const syncEvent = event as Event & {
    tag: string
    waitUntil: (p: Promise<unknown>) => void
  }
  if (syncEvent.tag !== OUTBOX_FLUSH_SYNC_TAG) return
  syncEvent.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'OUTBOX_FLUSH' })
        }
      })
  )
}) as EventListener)
