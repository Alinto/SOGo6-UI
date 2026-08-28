import type { CalendarEvent } from '@/features/calendars/calendars-types'
import type { CachedCalendarEventRecord } from '../types'
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

export async function getCachedCalendarEvents(
  userId: string
): Promise<CachedCalendarEventRecord | undefined> {
  return getOfflineDb(userId).cachedCalendarEvents.get(recordId(userId))
}

export async function listCachedCalendarEvents(
  userId: string
): Promise<CalendarEvent[]> {
  const row = await getCachedCalendarEvents(userId)
  if (!row) return []
  try {
    const parsed = JSON.parse(row.payloadJson) as CalendarEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
