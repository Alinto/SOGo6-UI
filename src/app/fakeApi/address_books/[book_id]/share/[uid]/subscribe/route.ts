import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  AddressBookShareData,
  AddressBookShareUser,
} from '@/features/address_books/address-books-types'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_ADDRESS_BOOK_SHARE_KEY = 'demo_address_book_share'
type ShareByAddressBook = Record<string, AddressBookShareData>

const okEnvelope = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

/**
 * POST /fakeApi/address_books/[book_id]/share/[uid]/subscribe
 * Owner-initiated action: force-adds this address book to the target user's
 * subscribed list, instead of waiting for them to subscribe themselves.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ book_id: string; uid: string }> }
) {
  const { book_id, uid } = await ctx.params
  const decodedUid = decodeURIComponent(uid)

  const all = getDemoData<ShareByAddressBook>(
    req,
    DEMO_ADDRESS_BOOK_SHARE_KEY,
    {}
  )
  const bookShare = all[book_id] ?? { users: {} }

  const existing = bookShare.users[decodedUid]
  const user: AddressBookShareUser = existing
    ? { ...existing, subscribed: true }
    : {
        uid: decodedUid,
        c_email: decodedUid,
        userClass: 'normal-user',
        rights: {
          can_view: false,
          can_create_objects: false,
          can_edit_objects: false,
          can_erase_objects: false,
        },
        subscribed: true,
      }

  bookShare.users[decodedUid] = user
  all[book_id] = bookShare

  const response = NextResponse.json(okEnvelope(user))
  setDemoData(response, DEMO_ADDRESS_BOOK_SHARE_KEY, all, req)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
