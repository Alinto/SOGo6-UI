import type { ApiNotification } from '@/features/user-settings/mail/notifications/mail-notifications-api-types'
import { NextRequest, NextResponse } from 'next/server'

const store = new Map<string, ApiNotification | null>()

function getNotification(accountId: string): ApiNotification | null {
  return store.get(accountId) ?? null
}

function apiGetResponse(notification: ApiNotification | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: { notification },
  }
}

function apiPostResponse(notification: ApiNotification | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: {
      filters: null,
      forward: null,
      vacation: null,
      notification,
    },
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  await new Promise((resolve) => setTimeout(resolve, 300))
  return NextResponse.json(apiGetResponse(getNotification(accountId)))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()
  const incoming = body.Notification as ApiNotification | undefined
  if (incoming) {
    store.set(accountId, incoming)
  }
  return NextResponse.json(apiPostResponse(getNotification(accountId)))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
