import { NextRequest, NextResponse } from 'next/server'

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function POST(
  _req: NextRequest,
  _ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  return NextResponse.json(ok({ job_id: 'fake-folder-export' }))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
