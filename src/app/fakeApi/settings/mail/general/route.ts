import type { MailGeneralSettings } from '@/features/user-settings/mail/general/mail-general-types'
import { NextRequest, NextResponse } from 'next/server'

const data: MailGeneralSettings = {
  displaySubscribeMailboxesOnly: false,
  EAS: false,
  countAllUnseen: false,
  sortByThreads: false,
  displayFullEmails: false,
  hideInlineAttachments: false,
  autoMarkAsRead: false,
  autoMarkAsReadDelay: '0',
  forwardMessages: 'inline',
  startReply: 'below',
  placeSignature: 'below',
  signOnNew: false,
  signOnReply: false,
  signOnForward: false,
  composeIn: 'html',
  defaultFontSize: 'md',
  displayRemoteImages: false,
  composeOpening: 'ask',
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
