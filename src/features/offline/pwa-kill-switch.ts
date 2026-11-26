/**
 * Client side of the PWA kill switch (`NEXT_PUBLIC_PWA_ENABLED` off):
 * unregister the app's service worker and drop its Cache Storage. Cache
 * Storage on this origin is only written by the service worker.
 */
export async function disableInstalledPwa(): Promise<void> {
  if (typeof window === 'undefined') return

  if ('serviceWorker' in navigator) {
    try {
      const rootScope = `${window.location.origin}/`
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations
          .filter((registration) => registration.scope === rootScope)
          .map((registration) => registration.unregister())
      )
    } catch {
      // Service workers unavailable (private mode, insecure context).
    }
  }

  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    } catch {
      // Cache Storage unavailable.
    }
  }
}
