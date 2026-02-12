'use client'

import { useServiceWorker } from '@/lib/pwa/hooks/use-service-worker'

export default function PWAInitializer() {
  useServiceWorker()
  return null
}