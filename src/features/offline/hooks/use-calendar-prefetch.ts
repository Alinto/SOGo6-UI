'use client'

import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { calendarsApiEndpoints } from '@/features/calendars/store/calendars-api'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import { useEffect } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { isPwaCalendarCacheEnabled } from '../flags'
import { useNetworkStatus } from '../network/use-network-status'
import { scheduleIdle } from '../prefetch/folder-tree'
import { startQuery } from '../prefetch/start-query'
import { CALENDAR_CACHE_DAYS } from '../types'
import { useCalendarCache } from './use-calendar-cache'

export function calendarPrefetchRange(now = new Date()): {
  startDate: string
  endDate: string
} {
  return {
    startDate: startOfDay(now).toISOString(),
    endDate: endOfDay(addDays(now, CALENDAR_CACHE_DAYS)).toISOString(),
  }
}

export function useCalendarPrefetch() {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.auth.user?.uid)
  const { isOnline, isProbing } = useNetworkStatus()
  const { cacheEvents } = useCalendarCache()

  useEffect(() => {
    if (!isPwaCalendarCacheEnabled() || !userId || !isOnline || isProbing) {
      return
    }
    const authUserId = getAuthUserId()
    if (!authUserId) return

    const { startDate, endDate } = calendarPrefetchRange()
    const cancelIdle = scheduleIdle(() => {
      const sub = startQuery<CalendarEvent[]>(
        dispatch,
        calendarsApiEndpoints.endpoints.getEvents.initiate({
          startDate,
          endDate,
        })
      )
      void sub
        .unwrap()
        .then((events) => cacheEvents(startDate, endDate, events ?? []))
        .catch(() => undefined)
        .finally(() => sub.unsubscribe())
    })
    return cancelIdle
  }, [cacheEvents, dispatch, isOnline, isProbing, userId])
}
