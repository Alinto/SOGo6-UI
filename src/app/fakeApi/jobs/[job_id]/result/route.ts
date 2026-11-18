import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  const isCalendarExport = job_id.startsWith('cal-export-')
  const content = isCalendarExport
    ? `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SOGo//Fake Export//EN\r\nEND:VCALENDAR\r\n`
    : `BEGIN:VCARD\nVERSION:3.0\nFN:Fake Export ${job_id}\nEND:VCARD\n`
  const filename = isCalendarExport ? `${job_id}.ics` : `export-${job_id}.vcf`
  const contentType = isCalendarExport
    ? 'text/calendar'
    : 'text/vcard; version=3.0'

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
