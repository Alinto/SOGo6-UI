import {
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import type {
  Calendar,
  CalendarSyncResult,
  CalendarSyncStatus,
} from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'

const STORAGE_KEY = 'demo_external_calendars'
const SYNC_STORAGE_KEY = 'demo_external_calendar_sync'

type ExternalSyncStore = Record<string, CalendarSyncStatus>

const defaultSyncStatus = (): CalendarSyncStatus => ({
  sync_status: 'undefined',
  last_sync: null,
  sync_error: null,
})

function getExternalCalendars(req: NextRequest): Calendar[] {
  return getDemoData(req, STORAGE_KEY, [] as Calendar[])
}

function getSyncStore(req: NextRequest): ExternalSyncStore {
  return getDemoData(req, SYNC_STORAGE_KEY, {} as ExternalSyncStore)
}

function makeCalendarKey(name: string, existing: Calendar[]): string {
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  let id = baseId || 'ics-calendar'
  let counter = 1
  while (existing.some((cal) => (cal.key ?? cal.id) === id)) {
    id = `${baseId}-${counter}`
    counter++
  }
  return id
}

export async function GET(req: NextRequest) {
  const calendars = getExternalCalendars(req)
  return NextResponse.json({
    data: { calendars, total_count: calendars.length },
    error_code: null,
    error_msg: null,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, url, color, sync_interval_minutes } = body as {
    name: string
    url: string
    color?: string | null
    sync_interval_minutes?: number
  }

  const calendars = getExternalCalendars(req)
  const key = makeCalendarKey(name, calendars)
  const now = new Date().toISOString()

  const newCalendar: Calendar = {
    key,
    id: key,
    name,
    description: null,
    color: color || '#3b82f6',
    source_type: 'ics',
    type: 'subscription',
    url,
    timezone: 'UTC',
    is_default: false,
    default: false,
    ctag: 0,
    created_at: now,
    updated_at: now,
  }

  calendars.push(newCalendar)

  const syncStore = getSyncStore(req)
  syncStore[key] = {
    sync_status: 'pending',
    last_sync: null,
    sync_error: null,
  }

  const response = NextResponse.json(
    { data: newCalendar, error_code: null, error_msg: null },
    { status: 201 }
  )
  setDemoData(response, STORAGE_KEY, calendars)
  setDemoData(response, SYNC_STORAGE_KEY, syncStore)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}

export { getExternalCalendars, getSyncStore, SYNC_STORAGE_KEY, STORAGE_KEY }
