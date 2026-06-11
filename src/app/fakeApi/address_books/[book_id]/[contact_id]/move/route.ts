import {
  normalizeGroupMembersForBook,
  removeContactFromAllDistributionLists,
} from '@/app/fakeApi/address_books/vcard-utils'
import { DEFAULT_VCARDS } from '@/app/fakeApi/utils/default-data'
import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /fakeApi/address_books/[book_id]/[contact_id]/move
 * Move a contact from one address book to another
 */
export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ book_id: string; contact_id: string }> }
) {
  const { book_id, contact_id } = await params
  const { targetBookId } = await req.json()

  if (!targetBookId || typeof targetBookId !== 'string') {
    return NextResponse.json(
      { error: 'targetBookId is required' },
      { status: 400 }
    )
  }

  if (book_id === targetBookId) {
    return NextResponse.json({ success: true })
  }

  const userVCards = getDemoData(req, 'demo_vcards', DEFAULT_VCARDS)
  const sourceContacts = userVCards[book_id] || []
  const contactIndex = sourceContacts.findIndex((item) => item.id === contact_id)

  if (contactIndex === -1) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  if (!userVCards[targetBookId]) {
    userVCards[targetBookId] = []
  }

  removeContactFromAllDistributionLists(userVCards, contact_id)

  const [contact] = sourceContacts.splice(contactIndex, 1)
  const targetContacts = userVCards[targetBookId]

  const movedContact = {
    ...contact,
    updated_at: new Date().toISOString(),
  }

  if (movedContact.kind === 'group' && movedContact.members?.length) {
    movedContact.members = normalizeGroupMembersForBook(
      targetContacts,
      movedContact.members
    )
  }

  targetContacts.push(movedContact)

  const response = NextResponse.json({ success: true })
  setDemoData(response, 'demo_vcards', userVCards, req)
  return response
}
