'use client'

import { useEffect, useState, useCallback } from 'react'

interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  registration: ServiceWorkerRegistration | null
  hasUpdate: boolean
  error: Error | null
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

export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    registration: null,
    hasUpdate: false,
    error: null,
  })

  const handleUpdateFound = useCallback((registration: ServiceWorkerRegistration) => {
    const newWorker = registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        log('🔄 [PWA] New Service Worker available')
        setStatus((prev) => ({ ...prev, hasUpdate: true }))
      }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      warn('⚠️ [PWA] Service Workers not supported in this browser')
      return
    }

    setStatus((prev) => ({ ...prev, isSupported: true }))

    const registerServiceWorker = async () => {
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration('/')
        
        if (existingRegistration) {
          log('✅ [PWA] Service Worker already registered:', existingRegistration.scope)
          setStatus((prev) => ({
            ...prev,
            isRegistered: true,
            registration: existingRegistration,
          }))
          existingRegistration.addEventListener('updatefound', () => handleUpdateFound(existingRegistration))
          return
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        log('✅ [PWA] Service Worker registered:', registration.scope)

        setStatus((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }))

        registration.addEventListener('updatefound', () => handleUpdateFound(registration))
      } catch (error) {
        logError('❌ [PWA] Service Worker registration failed:', error)
        setStatus((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Registration failed'),
        }))
      }
    }

    registerServiceWorker()
  }, [handleUpdateFound])

  return status
}
