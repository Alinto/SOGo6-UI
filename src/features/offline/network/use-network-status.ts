'use client'

import { useSyncExternalStore } from 'react'
import { probeNetwork } from './probe'

export type NetworkStatus = { isOnline: boolean; isProbing: boolean }

const SERVER_SNAPSHOT: NetworkStatus = { isOnline: true, isProbing: false }

const browserStatus = (): NetworkStatus => {
  if (typeof navigator === 'undefined') {
    return { isOnline: true, isProbing: false }
  }
  return { isOnline: navigator.onLine, isProbing: navigator.onLine }
}

export const NETWORK_PROBE_INTERVAL_MS = 30_000

let snapshot: NetworkStatus = browserStatus()
const listeners = new Set<() => void>()
let started = false
let intervalId: number | undefined
let probeInFlight = false
let lastNavigatorOnLine =
  typeof navigator === 'undefined' ? true : navigator.onLine
let generation = 0

function emit(next: NetworkStatus) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

async function refresh() {
  if (probeInFlight) return
  probeInFlight = true
  const gen = generation
  emit({ ...snapshot, isProbing: true })
  const ok = await probeNetwork()
  probeInFlight = false
  if (gen !== generation) return
  emit({ isOnline: ok, isProbing: false })
}

function onOnline() {
  lastNavigatorOnLine = true
  void refresh()
}

function onOffline() {
  lastNavigatorOnLine = false
  probeInFlight = false
  emit({ isOnline: false, isProbing: false })
}

function syncNavigatorFlag() {
  if (typeof navigator === 'undefined') return
  const now = navigator.onLine
  if (now !== lastNavigatorOnLine) {
    lastNavigatorOnLine = now
    if (!now) {
      probeInFlight = false
      emit({ isOnline: false, isProbing: false })
      return
    }
    void refresh()
    return
  }
  // DevTools often flips connectivity without a second `online` event.
  if (now && !snapshot.isOnline && !snapshot.isProbing) {
    void refresh()
  }
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  lastNavigatorOnLine = navigator.onLine
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  window.addEventListener('focus', syncNavigatorFlag)
  document.addEventListener('visibilitychange', syncNavigatorFlag)
  intervalId = window.setInterval(syncNavigatorFlag, NETWORK_PROBE_INTERVAL_MS)
  void refresh()
}

function stop() {
  if (!started || typeof window === 'undefined') return
  started = false
  generation += 1
  probeInFlight = false
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
  window.removeEventListener('focus', syncNavigatorFlag)
  document.removeEventListener('visibilitychange', syncNavigatorFlag)
  if (intervalId !== undefined) window.clearInterval(intervalId)
  intervalId = undefined
  snapshot = browserStatus()
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  start()
  return () => {
    listeners.delete(onStoreChange)
    if (listeners.size === 0) stop()
  }
}

function getSnapshot() {
  return snapshot
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

/**
 * Shared connectivity probe — one interval/listeners set for the whole app.
 * Banner, flush, and nav must see the same `isOnline` or the banner sticks
 * after DevTools "No throttling" while the outbox already flushed.
 */
export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
