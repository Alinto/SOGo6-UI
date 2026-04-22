import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  _ctx: { params: Promise<{ accountId: string; folder: string; mailId: string }> }
) {
  await req.json().catch(() => ({}))
  return NextResponse.json({
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
