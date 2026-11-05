import { getDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  Calendar,
  SharedCalendar,
} from '@/features/calendars/calendars-types'
import type { NextRequest } from 'next/server'

/**
 * Only the subscribed keys are stored (a few bytes): copying whole calendars
 * into `demo_calendars` pushes that cookie over the ~4 KB browser limit and
 * the browser silently drops it.
 */
export const SUBSCRIBED_STORAGE_KEY = 'demo_shared_calendar_subscriptions'

const FULL_RIGHTS = {
  can_create_objects: true,
  can_erase_objects: true,
  confidential: 'modify',
  private: 'modify',
  public: 'modify',
} as const

const READ_RIGHTS = {
  can_create_objects: false,
  can_erase_objects: false,
  confidential: 'view-date-time',
  private: 'none',
  public: 'view-all',
} as const

const sharedCalendar = (
  key: string,
  name: string,
  color: string,
  owner: string,
  nameOwner: string,
  rights: SharedCalendar['rights'] = READ_RIGHTS
): SharedCalendar => ({
  key,
  name,
  color,
  owner,
  name_owner: nameOwner,
  description: null,
  ctag: 1,
  is_default: false,
  source_type: 'local',
  timezone: 'Europe/Paris',
  rights,
  subscribed: false,
})

/** Calendars other users have shared with the fake connected account. */
export const SHARED_CALENDARS_CATALOG: SharedCalendar[] = [
  sharedCalendar(
    'shared-cal-1',
    'Team Calendar',
    '#10b981',
    'team-lead@example.com',
    'Team Lead',
    FULL_RIGHTS
  ),
  sharedCalendar(
    'shared-cal-3',
    'Team Holidays',
    '#f59e0b',
    'team-lead@example.com',
    'Team Lead'
  ),
  sharedCalendar(
    'shared-cal-4',
    'On-call rotation',
    '#ef4444',
    'team-lead@example.com',
    'Team Lead',
    FULL_RIGHTS
  ),
  sharedCalendar(
    'shared-cal-2',
    'Company Meetings',
    '#8b5cf6',
    'admin@example.com',
    'Administrator'
  ),
]

/** Keys already present in the default `demo_calendars` shared list. */
const DEFAULT_SUBSCRIBED_KEYS = ['shared-cal-1', 'shared-cal-2']

const calendarKey = (calendar: Calendar) => calendar.key ?? calendar.id ?? ''

const CATALOG_KEYS = new Set(SHARED_CALENDARS_CATALOG.map(calendarKey))

export function getSubscribedKeys(req: NextRequest): string[] {
  const keys = getDemoData<unknown>(
    req,
    SUBSCRIBED_STORAGE_KEY,
    DEFAULT_SUBSCRIBED_KEYS
  )
  return Array.isArray(keys)
    ? keys.filter((key): key is string => typeof key === 'string')
    : DEFAULT_SUBSCRIBED_KEYS
}

/** True for a catalog shared calendar the user is not subscribed to. */
export function isUnsubscribedSharedCalendar(
  req: NextRequest,
  key: string
): boolean {
  return CATALOG_KEYS.has(key) && !getSubscribedKeys(req).includes(key)
}

/**
 * Shared calendars to show in the sidebar: stored entries the user is still
 * subscribed to (or that are not in the catalog), plus subscribed catalog
 * calendars that are not stored yet.
 */
export function getSubscribedSharedCalendars(
  req: NextRequest,
  storedShared: Calendar[]
): Calendar[] {
  const subscribed = new Set(getSubscribedKeys(req))
  const kept = storedShared.filter((calendar) => {
    const key = calendarKey(calendar)
    return !CATALOG_KEYS.has(key) || subscribed.has(key)
  })
  const keptKeys = new Set(kept.map(calendarKey))
  const added = SHARED_CALENDARS_CATALOG.filter((calendar) => {
    const key = calendarKey(calendar)
    return subscribed.has(key) && !keptKeys.has(key)
  }).map((calendar) => ({
    ...calendar,
    id: calendar.key,
    subscribed: true,
  }))
  return [...kept, ...added]
}
