import {
  DEFAULT_ADDRESS_BOOKS,
  DEFAULT_VCARDS,
} from '@/app/fakeApi/utils/default-data'
import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  applyBookEntriesQueryFromSearchParams,
  buildBookEntriesPaginationHeaders,
  hasBookEntriesListQuery,
} from '@/features/address_books/utils/legacy-book-entries-response'
import { normalizeContactsList } from '@/features/address_books/utils/normalize-contact'
import { NextRequest, NextResponse } from 'next/server'
import {
  buildVCardFromBody,
  normalizeGroupMembers,
} from '../vcard-utils'

function getRequestSearchParams(req: NextRequest): URLSearchParams {
  return req.nextUrl?.searchParams ?? new URL(req.url).searchParams
}
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

function jsonWithListQueryHeaders(
  items: ReturnType<typeof normalizeContactsList>,
  searchParams: URLSearchParams
) {
  const result = applyBookEntriesQueryFromSearchParams(items, searchParams)
  const response = NextResponse.json(result.items)
  const headers = buildBookEntriesPaginationHeaders(result)
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  return response
}

/**
 * GET /fakeApi/address_books/[book_id]
 * Returns contacts (VCards) for a specific address book.
 * Supports search, sort and pagination query params (mirrors the real backend).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
  const searchParams = getRequestSearchParams(req)
  const applyQuery = hasBookEntriesListQuery(searchParams)

  if (book_id === 'all') {
    const allContacts = normalizeContactsList(
      Object.entries(userVCards).flatMap(([sourceBookId, contacts]) =>
        contacts
          .filter((contact) => contact.kind !== 'group')
          .map((contact) => ({
            ...contact,
            addressBookKey: sourceBookId,
          }))
      )
    )

    const response = applyQuery
      ? jsonWithListQueryHeaders(allContacts, searchParams)
      : NextResponse.json(allContacts)

    if (!req.cookies.get('demo_vcards')) {
      setDemoData(response, 'demo_vcards', userVCards, req)
    }
    return response
  }

  const contacts = normalizeContactsList(userVCards[book_id] || [])

  const response = applyQuery
    ? jsonWithListQueryHeaders(contacts, searchParams)
    : NextResponse.json(contacts)

  if (!req.cookies.get('demo_vcards')) {
    setDemoData(response, 'demo_vcards', userVCards, req)
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

  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  if (!userVCards[book_id]) {
    userVCards[book_id] = []
  }

  let contactId = body.id
  if (!contactId) {
    const existingIds = userVCards[book_id].map((c) => c.id)
    do {
      contactId = `${book_id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    } while (existingIds.includes(contactId))
  } else {
    if (userVCards[book_id].some((c) => c.id === contactId)) {
      return NextResponse.json(
        { error: 'Contact with this ID already exists' },
        { status: 409 }
      )
    }
  }

  const newContact = buildVCardFromBody({
    ...body,
    id: contactId,
    members:
      body.kind === 'group'
        ? normalizeGroupMembers(body.members)
        : body.members,
  })

  userVCards[book_id].push(newContact)

  if (userVCards[book_id].length > 200) {
    userVCards[book_id] = userVCards[book_id].slice(-200)
  }

  const response = NextResponse.json(newContact, { status: 201 })
  setDemoData(response, 'demo_vcards', userVCards, req)
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

  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  const addressBook = findAddressBook(userAddressBooks, book_id)

  if (!addressBook) {
    return NextResponse.json(
      { error: 'Address book not found' },
      { status: 404 }
    )
  }

  if (name) addressBook.name = name
  if (description !== undefined) addressBook.description = description
  addressBook.updated_at = new Date().toISOString()

  const response = NextResponse.json(addressBook)
  setDemoData(response, 'demo_address_books', userAddressBooks, req)
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

  const userAddressBooks = getDemoData(
    req,
    'demo_address_books',
    DEFAULT_ADDRESS_BOOKS
  )

  const personalIndex = userAddressBooks.personals.findIndex(
    (book) => book.id === book_id
  )
  if (personalIndex !== -1) {
    userAddressBooks.personals.splice(personalIndex, 1)

    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks, req)
    setDemoData(response, 'demo_vcards', userVCards, req)
    return response
  }

  const subscriptionIndex = userAddressBooks.subscriptions.findIndex(
    (book) => book.id === book_id
  )
  if (subscriptionIndex !== -1) {
    userAddressBooks.subscriptions.splice(subscriptionIndex, 1)

    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks, req)
    setDemoData(response, 'demo_vcards', userVCards, req)
    return response
  }

  const globalIndex = userAddressBooks.globals.findIndex(
    (book) => book.id === book_id
  )
  if (globalIndex !== -1) {
    userAddressBooks.globals.splice(globalIndex, 1)

    const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
    delete userVCards[book_id]

    const response = NextResponse.json({ success: true }, { status: 200 })
    setDemoData(response, 'demo_address_books', userAddressBooks, req)
    setDemoData(response, 'demo_vcards', userVCards, req)
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
