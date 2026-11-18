import { NextRequest, NextResponse } from 'next/server'

const delegates = ['delegate@example.org']

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'OK' as const,
})

export async function GET() {
  return NextResponse.json(ok(delegates))
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = body.email?.trim()
  if (!email) {
    return NextResponse.json(
      { error_code: 'S000002', error_msg: 'Email is required' },
      { status: 400 }
    )
  }
  if (!delegates.includes(email)) delegates.push(email)
  return NextResponse.json(ok(delegates))
}
