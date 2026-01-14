import {
  DEFAULT_ADDRESS_BOOKS,
  DEFAULT_VCARDS,
} from '@/app/fakeApi/utils/default-data'
import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import { VCard } from '@/features/address_books/address-books-types'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Find an address book by ID in all categories
 */
function findAddressBook(
  userAddressBooks: typeof DEFAULT_ADDRESS_BOOKS,
  book_id: string
) {
  return (
    userAddressBooks.personals.find((book) => book.id === book_id) ||
    userAddressBooks.subscriptions.find((book) => book.id === book_id) ||
    userAddressBooks.globals.find((book) => book.id === book_id)
  )
}

/**
 * GET /fakeApi/address_books/[book_id]
 * Returns all contacts (VCards) for a specific address book
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params

  // Read the VCards from the cookie
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  // Return the VCards for the specified book_id
  const contacts = userVCards[book_id] || []

  const response = NextResponse.json(contacts)
  // Only if the cookie does not exist yet (first visit)
  if (!req.cookies.get('demo_vcards')) {
    setDemoData(response, 'demo_vcards', userVCards)
  }
  return response
}

/**
 * POST /fakeApi/address_books/[book_id]
 * Create a new contact (VCard) in the specified address book
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params
  const body = await req.json()

  // Read the VCards from the cookie
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  // Check that the book_id exists (initialize if necessary)
  if (!userVCards[book_id]) {
    userVCards[book_id] = []
  }

  // Generate a unique ID for the contact
  let contactId = body.id
  if (!contactId) {
    const existingIds = userVCards[book_id].map((c) => c.id)
    do {
      contactId = `${book_id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    } while (existingIds.includes(contactId))
  } else {
    // If the ID is provided, check that it does not already exist
    if (userVCards[book_id].some((c) => c.id === contactId)) {
      return NextResponse.json(
        { error: 'Contact with this ID already exists' },
        { status: 409 }
      )
    }
  }

  // Create the new contact with explicit whitelist
  const newContact: VCard = {
    id: contactId,
    version: '4.0',
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    middleName: body.middleName,
    prefix: body.prefix,
    suffix: body.suffix,
    nickname: body.nickname,
    title: body.title,
    organization: body.organization,
    department: body.department,
    jobTitle: body.jobTitle,
    note: body.note,
    categories: body.categories || [],
    urls: body.urls || [],
    photos: body.photos || [],
    emails: body.emails || [],
    phoneNumbers: body.phoneNumbers || [],
    addresses: body.addresses || [],
    impp: body.impp || [],
    geo: body.geo,
    birthday: body.birthday,
    anniversary: body.anniversary,
    sound: body.sound,
    uid: body.uid,
    key: body.key,
    created_at: new Date().toISOString(), // ✅ FIX 1
    updated_at: new Date().toISOString(), // ✅ FIX 1
  }

  // Add the contact
  userVCards[book_id].push(newContact)

  // Limit to 200 contacts max per address book (keep the last 200)
  if (userVCards[book_id].length > 200) {
    userVCards[book_id] = userVCards[book_id].slice(-200)
  }

  // Save in the cookie
  const response = NextResponse.json(newContact, { status: 201 })
  setDemoData(response, 'demo_vcards', userVCards)
  return response
}

/**
 * PATCH /fakeApi/address_books/[book_id]
 * Update address book metadata (name, description)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params
  const body = await req.json()
  const { name, description } = body

  // Read the data from the cookie
  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  // Find the address book
  const addressBook = findAddressBook(userAddressBooks, book_id)

  if (!addressBook) {
    return NextResponse.json(
      { error: 'Address book not found' },
      { status: 404 }
    )
  }

  // Modify the address book (business logic preserved)
  if (name) addressBook.name = name
  if (description !== undefined) addressBook.description = description
  addressBook.updated_at = new Date().toISOString() // ✅ FIX 3

  // Save in the cookie
  const response = NextResponse.json(addressBook)
  setDemoData(response, 'demo_address_books', userAddressBooks)
  return response
}

/**
 * DELETE /fakeApi/address_books/[book_id]
 * Delete an address book and all its contacts
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params

  // Read the data from the cookie
  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  // Find and delete in all arrays (business logic preserved)
  const personalIndex = userAddressBooks.personals.findIndex(
    (book) => book.id === book_id
  )
  if (personalIndex !== -1) {
    userAddressBooks.personals.splice(personalIndex, 1)

    // Also delete the associated contacts
    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks)
    setDemoData(response, 'demo_vcards', userVCards)
    return response
  }

  const subscriptionIndex = userAddressBooks.subscriptions.findIndex(
    (book) => book.id === book_id
  )
  if (subscriptionIndex !== -1) {
    userAddressBooks.subscriptions.splice(subscriptionIndex, 1)

    // Also delete the associated contacts
    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks)
    setDemoData(response, 'demo_vcards', userVCards)
    return response
  }

  const globalIndex = userAddressBooks.globals.findIndex(
    (book) => book.id === book_id
  )
  if (globalIndex !== -1) {
    userAddressBooks.globals.splice(globalIndex, 1)

    // Also delete the associated contacts
    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks)
    setDemoData(response, 'demo_vcards', userVCards)
    return response
  }

  return NextResponse.json({ error: 'Address book not found' }, { status: 404 })
}

export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'POST', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
