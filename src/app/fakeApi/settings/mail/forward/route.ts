import { MailForward } from '@/features/user-settings/mail/forward/mail-forward-types'
import { NextRequest, NextResponse } from 'next/server'

const data: MailForward = {
  enabled: false,
  emails: [],
  email: '',
  alwaysForward: false,
  keepCopy: false,
}

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  Object.assign(data, body)
  return NextResponse.json(data)
}
