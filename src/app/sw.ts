/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig, SerwistPlugin } from 'serwist'
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
} from 'serwist'
import { OUTBOX_FLUSH_SYNC_TAG } from '../features/offline/types'
import {
  filterPrecacheEntries,
  isNavigationRequest,
  LEGACY_PAGES_CACHE,
  OFFLINE_FALLBACK_LOCALES,
  offlineFallbackPath,
  pathnameFromRequestUrl,
  stripEnvSecrets,
  SW_RUNTIME_CACHES,
} from './sw-runtime'
import { handleShareTarget, isShareTargetRequest } from './sw-share'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const expire = (maxEntries: number, maxAgeSeconds: number) =>
  new ExpirationPlugin({ maxEntries, maxAgeSeconds })

/** `/env` copy safe for Cache Storage (no staging prefill password). */
async function sanitizeEnvResponse(
  response: Response
): Promise<Response | null> {
  if (response.status !== 200) return null
  try {
    const safe = stripEnvSecrets(await response.clone().json())
    if (!safe) return null
    const headers = new Headers(response.headers)
    headers.delete('content-length')
    return new Response(JSON.stringify(safe), {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch {
    return null
  }
}

/** Cache `/env` for offline cold boot, minus the staging prefill password. */
const envCachePlugin: SerwistPlugin = {
  cacheWillUpdate: ({ response }) => sanitizeEnvResponse(response),
}

/** Rewrite `/env` entries stored unsanitized by older workers. */
async function sanitizeEnvCache(): Promise<void> {
  if (!(await caches.has(SW_RUNTIME_CACHES.env))) return
  const cache = await caches.open(SW_RUNTIME_CACHES.env)
  for (const request of await cache.keys()) {
    const cached = await cache.match(request)
    const safe = cached ? await sanitizeEnvResponse(cached) : null
    if (safe) await cache.put(request, safe)
    else await cache.delete(request)
  }
}

const serwist = new Serwist({
  precacheEntries: filterPrecacheEntries(self.__SW_MANIFEST),
  skipWaiting: false,
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
        cacheName: SW_RUNTIME_CACHES.ckeditor,
        plugins: [expire(64, 30 * 24 * 60 * 60)],
      }),
    },
    // Documents are never runtime-cached: exact precache URLs are served by
    // the precache route (revisioned per build); anything else (e.g.
    // `/en/auth/login?reason=session`) goes to the network and falls back to
    // the precached login / ~offline page through `fallbacks` when offline.
    {
      matcher: ({ request }) => isNavigationRequest(request),
      handler: new NetworkOnly(),
    },
    {
      matcher: /\/_next\/static\//,
      handler: new CacheFirst({
        cacheName: SW_RUNTIME_CACHES.nextStatic,
        plugins: [expire(128, 7 * 24 * 60 * 60)],
      }),
    },
    {
      matcher: /\/(?:icons|images)\//,
      handler: new CacheFirst({
        cacheName: SW_RUNTIME_CACHES.images,
        plugins: [expire(64, 30 * 24 * 60 * 60)],
      }),
    },
    {
      matcher: /\/manifest\.webmanifest/,
      handler: new NetworkFirst({
        cacheName: SW_RUNTIME_CACHES.manifest,
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
        cacheName: SW_RUNTIME_CACHES.env,
        networkTimeoutSeconds: 3,
        plugins: [envCachePlugin],
      }),
    },
    {
      matcher: /.*/i,
      method: 'GET',
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      ...OFFLINE_FALLBACK_LOCALES.map((locale) => ({
        url: `/${locale}/auth/login`,
        matcher({ request }: { request: Request }) {
          if (!isNavigationRequest(request)) return false
          const path = pathnameFromRequestUrl(request.url).replace(/\/$/, '')
          return path === `/${locale}/auth/login`
        },
      })),
      ...OFFLINE_FALLBACK_LOCALES.map((locale) => ({
        url: `/${locale}/~offline`,
        matcher({ request }: { request: Request }) {
          return (
            isNavigationRequest(request) &&
            offlineFallbackPath(request.url) === `/${locale}/~offline`
          )
        },
      })),
      {
        url: '/~offline',
        matcher({ request }: { request: Request }) {
          return isNavigationRequest(request)
        },
      },
    ],
  },
})

self.addEventListener('fetch', (event) => {
  if (!isShareTargetRequest(event.request, self.location.origin)) return
  event.respondWith(handleShareTarget(event.request, self.location.origin))
})

serwist.addEventListeners()

// Serwist already handles `SKIP_WAITING` messages (skipWaiting: false).

self.addEventListener('activate', (event) => {
  // Older workers kept login HTML in `pages` for 7 days with no build
  // version, and stored `/env` unsanitized. Activation can happen offline,
  // so env is rewritten (offline cold boot needs it), not deleted.
  event.waitUntil(
    Promise.all([
      caches.delete(LEGACY_PAGES_CACHE).catch(() => false),
      sanitizeEnvCache().catch(() => undefined),
    ])
  )
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
