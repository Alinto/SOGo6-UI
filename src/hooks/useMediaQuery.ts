'use client'

import { CALENDAR_BREAKPOINTS } from '@/lib/constants/calendar-breakpoints'
import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
  }

  const getSnapshot = () => {
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    // Always return false on server to prevent hydration mismatch
    return false
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const BREAKPOINTS = CALENDAR_BREAKPOINTS

export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`)

export const useIsTablet = () =>
  useMediaQuery(
    `(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`
  )

export const useIsDesktop = () =>
  useMediaQuery(`(min-width: ${BREAKPOINTS.tablet + 1}px)`)
