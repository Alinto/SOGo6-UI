import { NextRequest, NextResponse } from 'next/server'

import { buildMailSearchResponse } from '@/app/fakeApi/utils/mailbox-list-helpers'
import type { MailSearchParams } from '@/features/mails/mails-types'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as MailSearchParams
  const { searchParams } = new URL(req.url)
  return NextResponse.json(buildMailSearchResponse(body, searchParams))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
