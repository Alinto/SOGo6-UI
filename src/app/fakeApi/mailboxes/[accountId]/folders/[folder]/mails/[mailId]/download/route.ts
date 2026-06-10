import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string; mailId: string }> }
) {
  const { mailId } = await ctx.params
  const body = await req.json().catch(() => ({ format: 'eml' }))
  const format = body?.format === 'zip' ? 'zip' : 'eml'
  const content =
    format === 'zip'
      ? 'PK fake zip content'
      : `From: demo@example.com\r\nTo: you@example.com\r\nSubject: Demo ${mailId}\r\n\r\nBody`
  const mime =
    format === 'zip' ? 'application/zip' : 'message/rfc822'

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="mail-${mailId}.${format}"`,
    },
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
