'use client'

import { useEffect, useState } from 'react'

const isDev = process.env.NODE_ENV === 'development'

function log(message: string) {
  if (isDev) {
    console.log(message)
  }
}

function getInitialOnlineStatus(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine
  }
  return true
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus)

  useEffect(() => {
    const handleOnline = () => {
      log('🌐 [Network] Connection restored')
      setIsOnline(true)
    }

    const handleOffline = () => {
      log('📡 [Network] Connection lost')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
