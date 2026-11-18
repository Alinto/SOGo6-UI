import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: [
      {
        uid: 'sogo-tests1',
        domain: 'example.org',
        last_activity: '1700000000',
        session_key: 'session-1',
      },
    ],
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
