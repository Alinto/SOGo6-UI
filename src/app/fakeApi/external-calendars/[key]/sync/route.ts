import { setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  CalendarSyncResult,
  CalendarSyncStatus,
} from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'
import {
  getExternalCalendars,
  getSyncStore,
  SYNC_STORAGE_KEY,
} from '../../route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const calendars = getExternalCalendars(req)
  if (!calendars.some((c) => (c.key ?? c.id) === key)) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Calendar not found' },
      { status: 404 }
    )
  }

  const syncStore = getSyncStore(req)
  const status: CalendarSyncStatus = syncStore[key] ?? {
    sync_status: 'undefined',
    last_sync: null,
    sync_error: null,
  }

  return NextResponse.json({
    data: status,
    error_code: null,
    error_msg: null,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const calendars = getExternalCalendars(req)
  if (!calendars.some((c) => (c.key ?? c.id) === key)) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Calendar not found' },
      { status: 404 }
    )
  }

  const syncStore = getSyncStore(req)
  const now = new Date().toISOString()
  syncStore[key] = {
    sync_status: 'completed',
    last_sync: now,
    sync_error: null,
  }

  const result: CalendarSyncResult = {
    inserted: 2,
    updated: 0,
    deleted: 0,
    total: 2,
  }

  const response = NextResponse.json({
    data: result,
    error_code: null,
    error_msg: null,
  })
  setDemoData(response, SYNC_STORAGE_KEY, syncStore)
  return response
}
