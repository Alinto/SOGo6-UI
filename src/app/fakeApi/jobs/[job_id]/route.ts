import { NextResponse } from 'next/server'

const FAKE_JOBS = new Map<string, { status: string; result?: Record<string, number> }>()

function ensureJob(jobId: string) {
  if (!FAKE_JOBS.has(jobId)) {
    FAKE_JOBS.set(jobId, {
      status: 'success',
      result: { created: 1, updated: 0, skipped: 0 },
    })
  }
  return FAKE_JOBS.get(jobId)!
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  const job = ensureJob(job_id)

  return NextResponse.json({
    data: {
      status: job.status,
      payload: {},
      result: job.result ?? null,
      error: null,
    },
    error_code: 'S000000',
    error_msg: 'OK',
  })
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  return GET(_req, { params })
}
