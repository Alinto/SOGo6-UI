'use client'

import { useTranslations } from 'next-intl'
import { memo, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isPwaEnabled } from '../flags'

/**
 * Shows a persistent toast when a new service worker is waiting.
 * Reload happens after `controllerchange` so the fresh SW actually serves
 * the reloaded page (reloading immediately would race skipWaiting).
 */
function PwaUpdateToast() {
  const t = useTranslations('PWA')
  const reloadRequested = useRef(false)

  useEffect(() => {
    if (!isPwaEnabled() || typeof navigator === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const onControllerChange = () => {
      if (!reloadRequested.current) return
      reloadRequested.current = false
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange
    )

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
              if (reloadRequested.current) window.location.reload()
            }, 3000)
          },
        },
        duration: Infinity,
      })
    }

    void navigator.serviceWorker.ready.then((reg) => {
      const onUpdateFound = () => {
        const sw = reg.installing
        if (!sw) return
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            promptUpdate(sw)
          }
        })
      }
      reg.addEventListener('updatefound', onUpdateFound)
      if (reg.waiting && navigator.serviceWorker.controller) {
        promptUpdate(reg.waiting)
      }
    })

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      )
    }
  }, [t])

  return null
}

export default memo(PwaUpdateToast)
