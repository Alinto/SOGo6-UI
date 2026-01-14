import { DEFAULT_CALENDARS } from '@/app/fakeApi/utils/default-data'
import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type { Calendar } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Find a calendar by ID in all categories
 */
function findCalendar(
  userCalendars: typeof DEFAULT_CALENDARS,
  calendarId: string
): Calendar | undefined {
  return (
    userCalendars.personal.find((cal) => cal.id === calendarId) ||
    userCalendars.shared.find((cal) => cal.id === calendarId) ||
    userCalendars.subscriptions.find((cal) => cal.id === calendarId)
  )
}

/**
 * Format notifications from frontend format to API format
 */
function formatNotifications(
  notifications: Array<{ type: string; timing: string | number }> | undefined
): Array<{
  method: 'email' | 'popup' | 'notification'
  minutes_before: number
}> {
  if (!notifications || !Array.isArray(notifications)) return []

  return notifications.map((notif) => ({
    method: (notif.type === 'email' ? 'email' : 'popup') as
      | 'email'
      | 'popup'
      | 'notification',
    minutes_before: Number(notif.timing) || 0,
  }))
}

/**
 * GET /fakeApi/calendars/[calendarId]
 * Get a specific calendar by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params

  // Read the data from the cookie
  const userCalendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)

  // Find the calendar
  const calendar = findCalendar(userCalendars, calendarId)

  if (!calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
  }

  return NextResponse.json(calendar)
}

/**
 * PATCH /fakeApi/calendars/[calendarId]
 * Update a specific calendar by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const body = await req.json()

  // Read the data from the cookie
  const userCalendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)

  // Find the calendar
  const calendar = findCalendar(userCalendars, calendarId)

  if (!calendar) {
    return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
  }

  // Transform the notifications if present
  const updates = { ...body }

  if (body.eventNotifications) {
    updates.event_notifications = formatNotifications(body.eventNotifications)
    delete updates.eventNotifications
  }

  if (body.allDayNotifications) {
    updates.all_day_notifications = formatNotifications(
      body.allDayNotifications
    )
    delete updates.allDayNotifications
  }

  // Protect sensitive fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, owner, type, created_at, ...cleanUpdates } = updates

  // Modify the calendar with timestamp
  Object.assign(calendar, cleanUpdates, {
    updated_at: new Date().toISOString(),
  })

  // Save in the cookie
  const response = NextResponse.json(calendar)
  setDemoData(response, 'demo_calendars', userCalendars)
  return response
}

/**
 * DELETE /fakeApi/calendars/[calendarId]
 * Delete a specific calendar by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params

  // Read the data from the cookie
  const userCalendars = getDemoData(req, 'demo_calendars', DEFAULT_CALENDARS)

  // Find and delete in all arrays (business logic preserved)
  const personalIndex = userCalendars.personal.findIndex(
    (cal) => cal.id === calendarId
  )
  if (personalIndex !== -1) {
    userCalendars.personal.splice(personalIndex, 1)
    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_calendars', userCalendars)
    return response
  }

  const sharedIndex = userCalendars.shared.findIndex(
    (cal) => cal.id === calendarId
  )
  if (sharedIndex !== -1) {
    userCalendars.shared.splice(sharedIndex, 1)
    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_calendars', userCalendars)
    return response
  }

  const subscriptionIndex = userCalendars.subscriptions.findIndex(
    (cal) => cal.id === calendarId
  )
  if (subscriptionIndex !== -1) {
    userCalendars.subscriptions.splice(subscriptionIndex, 1)
    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_calendars', userCalendars)
    return response
  }

  return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
}

/**
 * OPTIONS /fakeApi/calendars/[calendarId]
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
