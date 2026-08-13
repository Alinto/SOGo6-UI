/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const OUTBOX_FLUSH_SYNC_TAG = 'outbox-flush'

const ckEditorCache = {
  matcher: ({ url }: { url: URL }) =>
    url.pathname.includes('ckeditor') ||
    url.pathname.includes('ck-editor') ||
    /ckeditor5/i.test(url.href),
  handler: new CacheFirst({
    cacheName: 'ckeditor-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Updates wait for user confirmation (PwaUpdateToast posts SKIP_WAITING);
  // immediate takeover would break lazy-loaded chunks of open pages.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ckEditorCache,
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document'
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
