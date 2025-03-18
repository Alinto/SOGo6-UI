import type { MailLabel } from '@/features/user-settings/mail/labels/mail-labels-types'
import { NextRequest, NextResponse } from 'next/server'

const data: MailLabel[] = [
  { id: '1', label: 'Work', IMAPLabel: 'Work', color: '#FF0000' },
  { id: '2', label: 'Personal', IMAPLabel: 'Personal', color: '#00FF00' },
  { id: '3', label: 'Family', IMAPLabel: 'Family', color: '#0000FF' },
  { id: '4', label: 'Friends', IMAPLabel: 'Friends', color: '#FFFF00' },
]

export async function GET() {
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newMailLabel = { id: String(data.length + 1), ...body }
  data.push(newMailLabel)
  return NextResponse.json(newMailLabel, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const newAddressBook = { id: String(data.length + 1), ...body }
  data.push(newAddressBook)
  return NextResponse.json(newAddressBook, { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST', 'PATCH'] }, { status: 200 })
}
