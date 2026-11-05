import { setDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  SHARED_CALENDARS_CATALOG,
  SUBSCRIBED_STORAGE_KEY,
  getSubscribedKeys,
} from '@/app/fakeApi/utils/shared-calendars-store'
import { decodeOwnerParam } from '@/app/fakeApi/utils/shared-owners'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/shared-calendars/{owner}
 * Every calendar `owner` shares with the connected user (not paginated).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const owner = decodeOwnerParam((await params).key)
  const subscribed = new Set(getSubscribedKeys(req))
  const calendars = SHARED_CALENDARS_CATALOG.filter(
    (calendar) => calendar.owner === owner
  ).map((calendar) => ({
    ...calendar,
    subscribed: subscribed.has(calendar.key ?? ''),
  }))

  return NextResponse.json({
    data: { calendars },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

/**
 * PUT /fakeApi/shared-calendars/{key}  body: { subscribe: 1 | 0 }
 * Subscribes to (1) or unsubscribes from (0) a shared calendar. Only the
 * subscribed keys are stored; GET /fakeApi/calendars rebuilds the shared
 * section of the sidebar from them.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const body = (await req.json().catch(() => ({}))) as { subscribe?: unknown }
  if (body.subscribe !== 0 && body.subscribe !== 1) {
    return NextResponse.json(
      { error_code: 'BAD_REQUEST', error_msg: 'subscribe must be 0 or 1' },
      { status: 400 }
    )
  }

  const calendar = SHARED_CALENDARS_CATALOG.find((c) => c.key === key)
  if (!calendar) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Calendar not found' },
      { status: 404 }
    )
  }

  const subscribe = body.subscribe === 1
  const otherKeys = getSubscribedKeys(req).filter((k) => k !== key)

  const response = NextResponse.json({
    data: { ...calendar, subscribed: subscribe },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
  setDemoData(
    response,
    SUBSCRIBED_STORAGE_KEY,
    subscribe ? [...otherKeys, key] : otherKeys,
    req
  )
  return response
}
