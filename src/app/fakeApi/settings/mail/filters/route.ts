import { MailFilter } from '@/features/user-settings/mail/filters/mail-filters-types'
import { NextRequest, NextResponse } from 'next/server'

const data: MailFilter[] = [
  {
    id: '1',
    name: 'Filter 1',
    operator: 'AND',
    enabled: true,
    rules: [
      {
        id: '1',
        field: 'from',
        condition: 'contains',
        value: 'alinto.eu',
      },
    ],
    actions: [
      {
        id: '1',
        action: 'move',
        value: 'inbox',
      },
    ],
  },
  {
    id: '2',
    name: 'Filter 2',
    operator: 'AND',
    enabled: true,
    rules: [
      {
        id: '1',
        field: 'header',
        field_value: 'X-Alinto-User',
        condition: 'contains',
        value: 'alinto.eu',
      },
    ],
    actions: [
      {
        id: '1',
        action: 'move',
        value: 'inbox',
      },
    ],
  },
  {
    id: '3',
    name: 'Filter 3',
    operator: 'AND',
    enabled: false,
    rules: [
      {
        id: '1',
        field: 'from',
        condition: 'contains',
        value: 'example.com',
      },
    ],
    actions: [
      {
        id: '1',
        action: 'move',
        value: 'inbox',
      },
    ],
  },
  {
    id: '4',
    name: 'Filter 4',
    operator: 'AND',
    enabled: true,
    rules: [
      {
        id: '1',
        field: 'from',
        condition: 'contains',
        value: 'example.com',
      },
    ],
    actions: [
      {
        id: '1',
        action: 'move',
        value: 'inbox',
      },
    ],
  },
]

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newAddressBook = { id: String(data.length + 1), ...body }
  data.push(newAddressBook)
  return NextResponse.json(newAddressBook, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const newAddressBook = { id: String(data.length + 1), ...body }
  data.push(newAddressBook)
  return NextResponse.json(newAddressBook, { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
