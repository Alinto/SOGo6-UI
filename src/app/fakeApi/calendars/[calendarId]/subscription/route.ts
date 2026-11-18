import { NextResponse } from 'next/server'

const publicUrls = new Map<string, string>()

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'OK' as const,
})

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const publicUrl = `https://example.test/calendars/${calendarId}/public`
  publicUrls.set(calendarId, publicUrl)
  return NextResponse.json(
    ok({ share_token: `token-${calendarId}`, public_url: publicUrl })
  )
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  publicUrls.delete(calendarId)
  return NextResponse.json(ok(null))
}
