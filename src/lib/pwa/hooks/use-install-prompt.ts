'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean
}

interface InstallPromptState {
  isInstallable: boolean
  isInstalled: boolean
  deferredPrompt: BeforeInstallPromptEvent | null
  error: Error | null
  install: () => Promise<void>
}

const isDev = process.env.NODE_ENV === 'development'

function log(message: string, ...args: unknown[]) {
  if (isDev) {
    console.log(message, ...args)
  }
}

function warn(message: string, ...args: unknown[]) {
  if (isDev) {
    console.warn(message, ...args)
  }
}

function logError(message: string, error?: unknown) {
  if (isDev) {
    console.error(message, error)
  }
}

function checkIfInstalled(): boolean {
  if (typeof window === 'undefined') return false

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorStandalone).standalone === true

  return isStandalone
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => checkIfInstalled())
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setError(null)
      log('📱 [PWA] Install prompt available')
    }

    const handleAppInstalled = () => {
      log('✅ [PWA] App installed successfully')
      setIsInstalled(true)
      setDeferredPrompt(null)
      setError(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const displayModeQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches
      setIsInstalled(matches)
      if (matches) {
        setDeferredPrompt(null)
      }
    }

    if (displayModeQuery.addEventListener) {
      displayModeQuery.addEventListener('change', handleDisplayModeChange as (e: Event) => void)
    } else {
      displayModeQuery.addListener(handleDisplayModeChange as (e: MediaQueryListEvent) => void)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      
      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener('change', handleDisplayModeChange as (e: Event) => void)
      } else {
        displayModeQuery.removeListener(handleDisplayModeChange as (e: MediaQueryListEvent) => void)
      }
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) {
      const notAvailableError = new Error('Install prompt not available')
      setError(notAvailableError)
      warn('⚠️ [PWA] Install prompt not available')
      return
    }

    setError(null)

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        log('✅ [PWA] User accepted the install prompt')
      } else {
        log('❌ [PWA] User dismissed the install prompt')
      }

      setDeferredPrompt(null)
    } catch (err) {
      const installError = err instanceof Error ? err : new Error('Install failed')
      setError(installError)
      logError('❌ [PWA] Install prompt failed:', err)
      throw installError
    }
  }

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    deferredPrompt,
    error,
    install,
  }
}
