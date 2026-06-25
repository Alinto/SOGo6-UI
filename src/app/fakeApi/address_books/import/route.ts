import { NextRequest, NextResponse } from 'next/server'

function enqueueFakeJob() {
  const jobId = `fake-job-${Date.now()}`
  return NextResponse.json(
    {
      data: { job_id: jobId },
      error_code: 'S000000',
      error_msg: 'OK',
    },
    { status: 202 }
  )
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  if (!formData.get('file')) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'S000716',
        error_msg: 'No file provided',
      },
      { status: 400 }
    )
  }
  return enqueueFakeJob()
}
