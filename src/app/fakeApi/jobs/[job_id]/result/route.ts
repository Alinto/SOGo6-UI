import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  const content = `BEGIN:VCARD\nVERSION:3.0\nFN:Fake Export ${job_id}\nEND:VCARD\n`

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; version=3.0',
      'Content-Disposition': `attachment; filename="export-${job_id}.vcf"`,
    },
  })
}
