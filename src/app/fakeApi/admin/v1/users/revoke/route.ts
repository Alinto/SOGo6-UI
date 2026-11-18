import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    uid?: string[]
    redis_key?: string[]
  }
  const hasUid = Array.isArray(body.uid)
  const hasKey = Array.isArray(body.redis_key)
  if (hasUid === hasKey) {
    return NextResponse.json(
      {
        error_code: 'S000002',
        error_msg: 'Provide either uid or redis_key',
      },
      { status: 400 }
    )
  }
  return NextResponse.json({
    data: null,
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
