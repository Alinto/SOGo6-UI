import type { ApiVacation } from '@/features/user-settings/mail/vacation/mail-vacation-api-types'
import { NextRequest, NextResponse } from 'next/server'

const store = new Map<string, ApiVacation | null>()

function getVacation(accountId: string): ApiVacation | null {
  return store.get(accountId) ?? null
}

function apiGetResponse(vacation: ApiVacation | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: { vacation },
  }
}

function apiPostResponse(vacation: ApiVacation | null) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: {
      filters: null,
      vacation,
      forward: null,
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
  return NextResponse.json(apiGetResponse(getVacation(accountId)))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()
  const incoming = body.Vacation as ApiVacation | undefined
  if (incoming) {
    store.set(accountId, incoming)
  }
  return NextResponse.json(apiPostResponse(getVacation(accountId)))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
