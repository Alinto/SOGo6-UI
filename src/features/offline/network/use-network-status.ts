'use client'

import { useEffect, useState } from 'react'
import { probeNetwork } from './probe'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [isProbing, setIsProbing] = useState(false)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      setIsProbing(true)
      const ok = await probeNetwork()
      if (!cancelled) {
        setIsOnline(ok)
        setIsProbing(false)
      }
    }

    const onOnline = () => {
      void refresh()
    }
    const onOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    void refresh()

    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return { isOnline, isProbing }
}
