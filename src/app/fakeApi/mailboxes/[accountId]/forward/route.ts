import type { ApiForward } from '@/features/user-settings/mail/forward/mail-forward-api-types'
import { NextRequest, NextResponse } from 'next/server'

const store = new Map<string, ApiForward | null>()

function getForward(accountId: string): ApiForward | null {
  return store.get(accountId) ?? null
}

function apiGetResponse(forward: ApiForward | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: { forward },
  }
}

function apiPostResponse(forward: ApiForward | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: {
      filters: null,
      forward,
      vacation: null,
      notification: null,
    },
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  await new Promise((resolve) => setTimeout(resolve, 300))
  return NextResponse.json(apiGetResponse(getForward(accountId)))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()
  const incoming = body.Forward as ApiForward | undefined
  if (incoming) {
    store.set(accountId, incoming)
  }
  return NextResponse.json(apiPostResponse(getForward(accountId)))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
