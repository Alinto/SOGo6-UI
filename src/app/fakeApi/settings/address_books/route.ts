import { NextRequest, NextResponse } from 'next/server'

const data = [
  { id: '1', label: 'Familly' },
  { id: '2', label: 'Client' },
  { id: '3', label: 'Colleague' },
]

export async function GET() {
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
  return NextResponse.json({ allow: ['GET', 'POST', 'PATCH'] }, { status: 200 })
}
