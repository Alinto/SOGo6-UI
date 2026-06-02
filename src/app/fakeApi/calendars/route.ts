import { getExternalCalendars } from '@/app/fakeApi/external-calendars/route'
import { DEFAULT_CALENDARS } from '@/app/fakeApi/utils/default-data'
import {
  cleanupOldData,
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import type { Calendar } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Format notifications from frontend format to API format
 */
function formatNotifications(
  notifications: Array<{ type: string; timing: string | number }> | undefined
): Array<{
  method: 'email' | 'popup'
  minutes_before: number
}> {
  if (!notifications || !Array.isArray(notifications)) return []

  return notifications.map((notif) => ({
    method: notif.type === 'email' ? 'email' : 'popup',
    minutes_before: Number(notif.timing) || 0,
  }))
}

/**
 * GET /fakeApi/calendars
 * Returns a list of all calendars for the authenticated user
 * Includes personal, shared, and subscribed calendars
 * Each calendar includes event notification settings and preferences
 * Data is stored per-user in cookies for demo isolation
 */
export async function GET(req: NextRequest) {
  const userCalendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)
  const externalIcs = getExternalCalendars(req)
  const mergedSubscriptions = [
    ...userCalendars.subscriptions,
    ...externalIcs.filter(
      (ext) =>
        !userCalendars.subscriptions.some(
          (sub) => (sub.key ?? sub.id) === (ext.key ?? ext.id)
        )
    ),
  ]
  const responsePayload = {
    ...userCalendars,
    subscriptions: mergedSubscriptions,
  }

  const response = NextResponse.json(responsePayload)
  // Only if the cookie does not exist yet (first visit)
  if (!req.cookies.get('demo_calendars')) {
    setDemoData(response, 'demo_calendars', responsePayload, req)
  }
  return response
}

/**
 * POST /fakeApi/calendars
 * Create a new calendar for the authenticated user
 * Data is stored per-user in cookies for demo isolation
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name,
    description,
    color,
    type: rawType,
    eventDuration,
    showBusyStatus,
    eventNotifications,
    allDayNotifications,
    url,
  } = body

  const type =
    rawType === 'shared' || rawType === 'subscription' ? rawType : 'personal'

  // Read the data from the cookie
  const userCalendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)

  // Generate the ID (business logic preserved - same pattern as address books)
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let id = baseId
  let counter = 1
  const allCalendars = [
    ...userCalendars.personal,
    ...userCalendars.shared,
    ...userCalendars.subscriptions,
  ]

  while (allCalendars.some((cal) => cal.id === id)) {
    id = `${baseId}-${counter}`
    counter++
  }

  // Format the notifications
  const eventNotificationsFormatted = formatNotifications(eventNotifications)
  const allDayNotificationsFormatted = formatNotifications(allDayNotifications)

  // Create the new calendar with all default properties
  const newCalendar: Calendar = {
    id,
    name,
    description: description || '',
    color: color || '#3b82f6',
    type: type || 'personal',
    default: false,
    read_only: false,
    owner: 'user@example.com',
    event_duration: Number(eventDuration) || 30,
    show_as_busy: showBusyStatus ?? true,
    event_notifications: eventNotificationsFormatted,
    all_day_notifications: allDayNotificationsFormatted,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Add permissions if shared
    ...(type === 'shared' && { permissions: 'readwrite' as const }),
    // Add url if subscription
    ...(type === 'subscription' && { url: url || '' }),
  }

  // Add the calendar in the right category
  if (type === 'personal') {
    userCalendars.personal.push(newCalendar)
    // Limit to 100 calendars max
    if (userCalendars.personal.length > 100) {
      userCalendars.personal = cleanupOldData(userCalendars.personal, 100)
    }
  } else if (type === 'shared') {
    userCalendars.shared.push(newCalendar)
    // Limit to 100 calendars max
    if (userCalendars.shared.length > 100) {
      userCalendars.shared = cleanupOldData(userCalendars.shared, 100)
    }
  } else if (type === 'subscription') {
    userCalendars.subscriptions.push(newCalendar)
    // Limit to 100 calendars max
    if (userCalendars.subscriptions.length > 100) {
      userCalendars.subscriptions = cleanupOldData(
        userCalendars.subscriptions,
        100
      )
    }
  }

  // Save in the cookie
  const response = NextResponse.json(newCalendar, { status: 201 })
  setDemoData(response, 'demo_calendars', userCalendars, req)
  return response
}

/**
 * OPTIONS /fakeApi/calendars
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
