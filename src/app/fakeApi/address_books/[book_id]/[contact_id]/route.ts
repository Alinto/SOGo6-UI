import { DEFAULT_VCARDS } from '@/app/fakeApi/utils/default-data'
import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/address_books/[book_id]/[contact_id]
 * Get a specific contact (VCard) by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string; contact_id: string }> }
) {
  const { book_id, contact_id } = await params

  // Read the data from the cookie
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  // Get the contacts for the book_id
  const contacts = userVCards[book_id] || []

  // Find the contact by ID
  const contact = contacts.find((item) => item.id === contact_id)

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  return NextResponse.json(contact)
}

/**
 * PATCH /fakeApi/address_books/[book_id]/[contact_id]
 * Update a specific contact (VCard) by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string; contact_id: string }> }
) {
  const { book_id, contact_id } = await params

  // Read the data from the cookie
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  // Get the contacts for the book_id
  const contacts = userVCards[book_id] || []

  // Find the contact by ID
  const contact = contacts.find((item) => item.id === contact_id)

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  // Update the contact
  const updates = await req.json()

  // Prevent modification of protected fields
  const {
    id: _,
    book_id: __,
    version: ___,
    created_at: ____,
    ...cleanUpdates
  } = updates // ✅ FIX 2.1

  // Apply the modifications with timestamp
  Object.assign(contact, cleanUpdates, {
    updated_at: new Date().toISOString(), // ✅ FIX 2.2
  })

  // Save in the cookie
  const response = NextResponse.json(contact)
  setDemoData(response, 'demo_vcards', userVCards, req)
  return response
}

/**
 * DELETE /fakeApi/address_books/[book_id]/[contact_id]
 * Delete a specific contact (VCard) by ID
 * Data is stored per-user in cookies for demo isolation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string; contact_id: string }> }
) {
  const { book_id, contact_id } = await params

  // Read the data from the cookie
  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)

  // Get the contacts for the book_id
  const contacts = userVCards[book_id] || []

  // Find the index of the contact
  const contactIndex = contacts.findIndex((item) => item.id === contact_id)

  if (contactIndex === -1) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  // Delete the contact
  contacts.splice(contactIndex, 1)

  // Save in the cookie
  const response = NextResponse.json({ success: true }, { status: 200 })
  setDemoData(response, 'demo_vcards', userVCards, req)
  return response
}

/**
 * OPTIONS /fakeApi/address_books/[book_id]/[contact_id]
 * Returns allowed HTTP methods
 */
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
