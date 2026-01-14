import { DEFAULT_ADDRESS_BOOKS } from '@/app/fakeApi/utils/default-data'
import {
  cleanupOldData,
  getDemoData,
  setDemoData,
} from '@/app/fakeApi/utils/demo-storage'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/address_books
 * Returns all address books for the authenticated user
 * Includes globals, personals, and subscriptions
 * Data is stored per-user in cookies for demo isolation
 */
export async function GET(req: NextRequest) {
  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  const response = NextResponse.json(userAddressBooks)
  // Only if the cookie does not exist yet (first visit)
  if (!req.cookies.get('demo_address_books')) {
    setDemoData(response, 'demo_address_books', userAddressBooks)
  }
  return response
}

/**
 * POST /fakeApi/address_books
 * Create a new address book for the authenticated user
 * Data is stored per-user in cookies for demo isolation
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, type } = body

  // Validation of the type
  if (!['personal', 'shared', 'global'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid type. Must be "personal", "shared", or "global".' },
      { status: 400 }
    )
  }

  // Read the data from the cookie
  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  // Generate the ID (business logic preserved)
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let id = baseId
  let counter = 1
  const allBooks = [
    ...userAddressBooks.globals,
    ...userAddressBooks.personals,
    ...userAddressBooks.subscriptions,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Add the new address book in the right category
  if (type === 'personal') {
    userAddressBooks.personals.push(newAddressBook)
    // Limit to 100 address books max
    if (userAddressBooks.personals.length > 100) {
      userAddressBooks.personals = cleanupOldData(
        userAddressBooks.personals,
        100
      )
    }
  } else if (type === 'shared') {
    userAddressBooks.subscriptions.push(newAddressBook)
    // Limit to 100 address books max
    if (userAddressBooks.subscriptions.length > 100) {
      userAddressBooks.subscriptions = cleanupOldData(
        userAddressBooks.subscriptions,
        100
      )
    }
  } else if (type === 'global') {
    userAddressBooks.globals.push(newAddressBook)
    // Limit to 100 address books max
    if (userAddressBooks.globals.length > 100) {
      userAddressBooks.globals = cleanupOldData(userAddressBooks.globals, 100)
    }
  }

  // Save in the cookie
  const response = NextResponse.json(newAddressBook, { status: 201 })
  setDemoData(response, 'demo_address_books', userAddressBooks)
  return response
}

/**
 * OPTIONS /fakeApi/address_books
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
