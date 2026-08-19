'use client'

import { useEffect, useState } from 'react'
import { probeNetwork } from './probe'

/**
 * Tracks connectivity. DevTools "Offline" often sets `navigator.onLine`
 * without firing `online`/`offline` — we also poll that flag.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [isProbing, setIsProbing] = useState(false)

  useEffect(() => {
    let cancelled = false
    let lastNavigatorOnLine =
      typeof navigator === 'undefined' ? true : navigator.onLine

    const refresh = async () => {
      setIsProbing(true)
      const ok = await probeNetwork()
      if (!cancelled) {
        setIsOnline(ok)
        setIsProbing(false)
      }
    }

    const onOnline = () => {
      lastNavigatorOnLine = true
      void refresh()
    }
    const onOffline = () => {
      lastNavigatorOnLine = false
      setIsOnline(false)
    }

    const syncNavigatorFlag = () => {
      const now = navigator.onLine
      if (now === lastNavigatorOnLine) return
      lastNavigatorOnLine = now
      if (!now) {
        setIsOnline(false)
        return
      }
      void refresh()
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('focus', syncNavigatorFlag)
    document.addEventListener('visibilitychange', syncNavigatorFlag)
    const intervalId = window.setInterval(syncNavigatorFlag, 1000)
    void refresh()

    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('focus', syncNavigatorFlag)
      document.removeEventListener('visibilitychange', syncNavigatorFlag)
      window.clearInterval(intervalId)
    }
  }, [])

  return { isOnline, isProbing }
}
