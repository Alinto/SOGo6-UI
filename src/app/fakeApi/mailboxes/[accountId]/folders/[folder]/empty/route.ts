import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    error_code: 0,
    error_msg: '',
    data: { mails_deleted: 5 },
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
