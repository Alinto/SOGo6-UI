import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: { reminders: [], total_count: 0 },
    error_code: 'S000000',
    error_msg: 'OK',
  })
}
