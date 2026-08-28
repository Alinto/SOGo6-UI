'use client'

import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { useCallback } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import {
  getCachedCalendarEvents,
  listCachedCalendarEvents,
  saveCalendarEvents,
} from '../db/calendar-cache-store'
import { isPwaCalendarCacheEnabled } from '../flags'

export function useCalendarCache() {
  const cacheEvents = useCallback(
    async (rangeStart: string, rangeEnd: string, events: CalendarEvent[]) => {
      if (!isPwaCalendarCacheEnabled()) return
      const userId = getAuthUserId()
      if (!userId) return
      await saveCalendarEvents(userId, rangeStart, rangeEnd, events)
    },
    []
  )

  const readEvents = useCallback(async () => {
    if (!isPwaCalendarCacheEnabled()) return [] as CalendarEvent[]
    const userId = getAuthUserId()
    if (!userId) return []
    return listCachedCalendarEvents(userId)
  }, [])

  const readMeta = useCallback(async () => {
    if (!isPwaCalendarCacheEnabled()) return null
    const userId = getAuthUserId()
    if (!userId) return null
    return getCachedCalendarEvents(userId)
  }, [])

  return { cacheEvents, readEvents, readMeta }
}
