import { MailVacation } from '@/features/user-settings/mail/vacation/mail-vacation-types'
import { NextRequest, NextResponse } from 'next/server'

const data: MailVacation = {
  enabled: false,
  autoReply: {
    subject: '',
    message: '',
    constraints: {
      enableDates: false,
      enableHours: false,
      enableDays: false,
      startDate: '',
      endDate: '',
      startHour: '18:00',
      endHour: '',
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    },
    emails: [],
    response: {
      interval: '0',
      toMaillingList: false,
      alwaysSend: false,
    },
    discardMails: false,
  },
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
