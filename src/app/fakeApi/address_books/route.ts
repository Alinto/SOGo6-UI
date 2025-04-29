import { NextResponse } from 'next/server'

const data = {
  globals: [
    {
      name: 'Global',
      description: 'Global address book',
      type: 'global',
      id: 'global',
    },
    {
      name: 'Customers',
      description: 'Customers address book',
      type: 'global',
      id: 'customers',
    },
  ],
  personals: [
    {
      name: 'Work',
      description: 'Work address book',
      type: 'personal',
      id: 'work',
      default: true,
    },
    {
      name: 'Personal',
      description: 'kids address book',
      type: 'personal',
      id: 'personal',
    },
  ],
  subscriptions: [
    {
      name: 'SmokedKimchi address book',
      description: 'Shared address book',
      type: 'shared',
      id: 'smokedkimchi',
    },
  ],
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
