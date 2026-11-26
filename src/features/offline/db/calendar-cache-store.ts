import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { MAIL_CACHE_TTL_MS, type CachedCalendarEventRecord } from '../types'
import { getOfflineDb } from './offline-db'

function recordId(userId: string): string {
  return `${userId}:week`
}

export async function saveCalendarEvents(
  userId: string,
  rangeStart: string,
  rangeEnd: string,
  events: CalendarEvent[]
): Promise<void> {
  const record: CachedCalendarEventRecord = {
    id: recordId(userId),
    userId,
    rangeStart,
    rangeEnd,
    payloadJson: JSON.stringify(events),
    updatedAt: Date.now(),
  }
  await getOfflineDb(userId).cachedCalendarEvents.put(record)
}

/** The week snapshot, or undefined once older than the offline cache TTL. */
export async function getCachedCalendarEvents(
  userId: string,
  now = Date.now()
): Promise<CachedCalendarEventRecord | undefined> {
  const row = await getOfflineDb(userId).cachedCalendarEvents.get(
    recordId(userId)
  )
  if (!row || row.updatedAt < now - MAIL_CACHE_TTL_MS) return undefined
  return row
}

export async function listCachedCalendarEvents(
  userId: string,
  now = Date.now()
): Promise<CalendarEvent[]> {
  const row = await getCachedCalendarEvents(userId, now)
  if (!row) return []
  try {
    const parsed = JSON.parse(row.payloadJson) as CalendarEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
