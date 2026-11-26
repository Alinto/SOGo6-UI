'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isPwaEnabled } from '../flags'
import { reloadWindow } from './pwa-update-reload'

/** Background check for a new service worker while the app stays open. */
export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000
/** Floor between two checks (tab switches fire visibilitychange often). */
export const PWA_UPDATE_CHECK_MIN_GAP_MS = 5 * 60 * 1000

/**
 * Shows a persistent toast when a new service worker is waiting.
 * Reload happens after `controllerchange` so the fresh SW actually serves
 * the reloaded page (reloading immediately would race skipWaiting).
 * Other tabs that were controlled by the previous worker reload too: the new
 * worker only activates after a user accepted the update (skipWaiting is
 * off), and the old page would otherwise keep running against it.
 */
function PwaUpdateToast() {
  const t = useTranslations('PWA')
  const reloadRequested = useRef(false)

  useEffect(() => {
    if (!isPwaEnabled() || typeof navigator === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const container = navigator.serviceWorker
    // First install + clientsClaim also fires controllerchange: no reload then.
    const wasControlled = Boolean(container.controller)
    let reloading = false
    let cancelled = false
    let cleanupRegistration: (() => void) | undefined

    const reloadOnce = () => {
      if (reloading) return
      reloading = true
      reloadRequested.current = false
      reloadWindow()
    }

    const onControllerChange = () => {
      if (reloadRequested.current || wasControlled) reloadOnce()
    }

    container.addEventListener('controllerchange', onControllerChange)

    const promptUpdate = (sw: ServiceWorker) => {
      toast(t('update_available.string'), {
        id: 'pwa-update',
        action: {
          label: t('update_reload.string'),
          onClick: () => {
            reloadRequested.current = true
            sw.postMessage({ type: 'SKIP_WAITING' })
            // Safety net if controllerchange never fires (e.g. SW redundant)
            setTimeout(() => {
              if (reloadRequested.current) reloadOnce()
            }, 3000)
          },
        },
        duration: Infinity,
      })
    }

    void container.ready.then((reg) => {
      if (cancelled) return

      const onUpdateFound = () => {
        const sw = reg.installing
        if (!sw) return
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && container.controller) {
            promptUpdate(sw)
          }
        })
      }
      reg.addEventListener('updatefound', onUpdateFound)
      if (reg.waiting && container.controller) {
        promptUpdate(reg.waiting)
      }

      let lastCheck = Date.now()
      const checkForUpdate = () => {
        if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return
        const now = Date.now()
        if (now - lastCheck < PWA_UPDATE_CHECK_MIN_GAP_MS) return
        lastCheck = now
        void Promise.resolve()
          .then(() => reg.update())
          .catch(() => undefined)
      }
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      }
      const intervalId = window.setInterval(
        checkForUpdate,
        PWA_UPDATE_CHECK_INTERVAL_MS
      )
      document.addEventListener('visibilitychange', onVisibilityChange)

      cleanupRegistration = () => {
        reg.removeEventListener('updatefound', onUpdateFound)
        window.clearInterval(intervalId)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    })

    return () => {
      cancelled = true
      cleanupRegistration?.()
      container.removeEventListener('controllerchange', onControllerChange)
    }
  }, [t])

  return null
}

export default memo(PwaUpdateToast)
