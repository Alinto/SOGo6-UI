import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: string
    data?: unknown
  }
  return NextResponse.json({
    error_code: 0,
    error_msg: '',
    data: {
      action: body.action ?? 'tag',
      mail_uid: '1:42',
      tags_added: body.data,
    },
  })
}
