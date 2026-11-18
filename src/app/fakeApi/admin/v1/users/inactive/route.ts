import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { timestamp?: number }
  if (typeof body.timestamp !== 'number') {
    return NextResponse.json(
      { error_code: 'S000002', error_msg: 'timestamp is required' },
      { status: 400 }
    )
  }
  return NextResponse.json({
    data: null,
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
