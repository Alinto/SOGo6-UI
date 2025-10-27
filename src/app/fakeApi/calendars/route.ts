import { NextResponse } from 'next/server'

const data = {
  personal: [
    {
      id: 'personal-cal-1',
      name: 'Personal',
      description: 'My personal calendar',
      color: '#3b82f6',
      type: 'personal',
      default: true,
      read_only: false,
      owner: 'user@example.com',
      event_duration: 30,
      show_as_busy: true,
      event_notifications: [
        { method: 'popup', minutes_before: 0 },
        { method: 'email', minutes_before: 15 },
      ],
      all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
    },
    {
      id: 'personal-cal-2',
      name: 'Birthdays',
      description: 'Birthdays and anniversaries',
      color: '#ec4899',
      type: 'personal',
      default: false,
      read_only: false,
      owner: 'user@example.com',
      event_duration: 0,
      show_as_busy: false,
      event_notifications: [{ method: 'popup', minutes_before: 0 }],
      all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
    },
    {
      id: 'personal-cal-3',
      name: 'Anniversaires',
      description: 'Birthdays and anniversaries',
      color: '#ec4899',
      type: 'personal',
      default: false,
      read_only: false,
      owner: 'user@example.com',
      event_duration: 0,
      show_as_busy: false,
      event_notifications: [{ method: 'popup', minutes_before: 0 }],
      all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
    },
  ],
  shared: [
    {
      id: 'shared-cal-1',
      name: 'Team Calendar',
      description: 'Shared team events and meetings',
      color: '#10b981',
      type: 'shared',
      default: false,
      read_only: false,
      owner: 'team-lead@example.com',
      permissions: 'readwrite',
      event_duration: 60,
      show_as_busy: true,
      event_notifications: [
        { method: 'popup', minutes_before: 0 },
        { method: 'email', minutes_before: 30 },
      ],
      all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
    },
    {
      id: 'shared-cal-2',
      name: 'Company Meetings',
      description: 'All-hands meetings and announcements',
      color: '#8b5cf6',
      type: 'shared',
      default: false,
      read_only: true,
      owner: 'admin@example.com',
      permissions: 'read',
      event_duration: 60,
      show_as_busy: true,
      event_notifications: [{ method: 'popup', minutes_before: 0 }],
      all_day_notifications: [{ method: 'popup', minutes_before: 1440 }],
    },
  ],
  subscriptions: [
    {
      id: 'sub-cal-1',
      name: 'Weather Calendar',
      description: 'Weather events subscription',
      color: '#06b6d4',
      type: 'subscription',
      default: false,
      read_only: true,
      owner: 'weather-service@example.com',
      url: 'https://weather-service.com/calendar',
      event_notifications: [],
      all_day_notifications: [],
    },
  ],
}

/**
 * GET /fakeApi/calendars
 * Returns a list of all calendars for the authenticated user
 * Includes personal, shared, and subscribed calendars
 * Each calendar includes event notification settings and preferences
 */
export async function GET() {
  return NextResponse.json(data)
}

/**
 * OPTIONS /fakeApi/calendars
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
