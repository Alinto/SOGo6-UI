import { NextRequest, NextResponse } from 'next/server'
import { addressBooksData } from './data'

export async function GET() {
  return NextResponse.json(addressBooksData)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, type } = body

  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let id = baseId
  let counter = 1
  const allBooks = [
    ...addressBooksData.globals,
    ...addressBooksData.personals,
    ...addressBooksData.subscriptions,
  ]

  while (allBooks.some((book) => book.id === id)) {
    id = `${baseId}-${counter}`
    counter++
  }

  const newAddressBook = {
    name,
    description: description || '',
    type,
    id,
    default: false,
  }

  if (type === 'personal') {
    addressBooksData.personals.push(newAddressBook)
  } else if (type === 'shared') {
    addressBooksData.subscriptions.push(newAddressBook)
  }

  return NextResponse.json(newAddressBook, { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
