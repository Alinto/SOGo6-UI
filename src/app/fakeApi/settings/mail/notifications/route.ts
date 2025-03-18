import { MailNotifications } from '@/features/user-settings/mail/notifications/mail-notifications-type'
import { NextRequest, NextResponse } from 'next/server'

const data: MailNotifications = {
  enabled: false,
  emails: [{ value: 'henry@fafenback.org' }],
  email: '',
  message: 'New message received on your account',
}

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({ ...data, ...body }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({ ...data, ...body }, { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST', 'PATCH'] }, { status: 200 })
}
