import { NextRequest, NextResponse } from 'next/server'

const okEnvelope = (raw: string) => ({
  data: { raw },
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ mailId: string }> }
) {
  const { mailId } = await ctx.params
  return NextResponse.json(
    okEnvelope(
      `From: demo@example.com\r\nTo: you@example.com\r\nSubject: Demo ${mailId}\r\n\r\nRaw body`
    )
  )
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'OPTIONS'] })
}
