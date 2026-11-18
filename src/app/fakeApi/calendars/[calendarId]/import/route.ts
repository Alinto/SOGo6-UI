import { NextResponse } from 'next/server'

/**
 * POST /fakeApi/calendars/{calendarId}/import
 * Mirrors the real backend: enqueue an ICS import and return a job id.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params

  return NextResponse.json({
    data: { job_id: `cal-import-${calendarId}` },
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
