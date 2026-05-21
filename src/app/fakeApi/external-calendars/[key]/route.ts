import { setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type { Calendar } from '@/features/calendars/calendars-types'
import { NextRequest, NextResponse } from 'next/server'
import {
  getExternalCalendars,
  getSyncStore,
  STORAGE_KEY,
  SYNC_STORAGE_KEY,
} from '../route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const calendars = getExternalCalendars(req)
  const calendar = calendars.find((c) => (c.key ?? c.id) === key)
  if (!calendar) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Calendar not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({
    data: calendar,
    error_code: null,
    error_msg: null,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const body = await req.json()
  const calendars = getExternalCalendars(req)
  const index = calendars.findIndex((c) => (c.key ?? c.id) === key)
  if (index < 0) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Calendar not found' },
      { status: 404 }
    )
  }

  const existing = calendars[index]
  const updated: Calendar = {
    ...existing,
    ...(body.name != null ? { name: body.name } : {}),
    ...(body.color != null ? { color: body.color } : {}),
    ...(body.sync_config?.url != null ? { url: body.sync_config.url } : {}),
    updated_at: new Date().toISOString(),
  }
  calendars[index] = updated

  const response = NextResponse.json({
    data: updated,
    error_code: null,
    error_msg: null,
  })
  setDemoData(response, STORAGE_KEY, calendars)
  return response
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const calendars = getExternalCalendars(req).filter(
    (c) => (c.key ?? c.id) !== key
  )
  const syncStore = getSyncStore(req)
  delete syncStore[key]

  const response = new NextResponse(null, { status: 204 })
  setDemoData(response, STORAGE_KEY, calendars)
  setDemoData(response, SYNC_STORAGE_KEY, syncStore)
  return response
}
