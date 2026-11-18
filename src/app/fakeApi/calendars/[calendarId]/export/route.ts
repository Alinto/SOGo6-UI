import { NextResponse } from 'next/server'

/**
 * GET /fakeApi/calendars/{calendarId}/export
 * Mirrors the real backend: enqueue an ICS export and return a job id.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params

  return NextResponse.json({
    data: { job_id: `cal-export-${calendarId}` },
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
