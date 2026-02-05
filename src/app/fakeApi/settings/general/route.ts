import { NextRequest, NextResponse } from 'next/server'

const data = {
  language: 'fr',
  timezone: 'Europe/Paris',
  shortDateStyle: '01-Fév-25',
  longDateStyle: 'Samedi, Février 01, 2025',
  test: crypto.randomUUID(),
  timeStyle: '15:02',
  defaultView: 'Mail',
  enableNotifications: false,
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
