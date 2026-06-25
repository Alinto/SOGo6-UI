import { NextResponse } from 'next/server'

export async function GET() {
  const jobId = `fake-export-${Date.now()}`
  return NextResponse.json(
    {
      data: { job_id: jobId },
      error_code: 'S000000',
      error_msg: 'OK',
    },
    { status: 202 }
  )
}
