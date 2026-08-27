import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import type {
  AddressBookShareData,
  AddressBookShareUser,
  AddressBookShareUserClass,
} from '@/features/address_books/address-books-types'
import { ANY_AUTHENTICATED_UID } from '@/features/address_books/utils/address-book-permission-mapping'
import { USER_CLASS_ANY } from '@/lib/constants/user-class'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_ADDRESS_BOOK_SHARE_KEY = 'demo_address_book_share'
type ShareByAddressBook = Record<string, AddressBookShareData>

/**
 * Wire shape sent by the client: PUT body is a bare array of these. `uid` is
 * omitted by the client for the "any authenticated user" pseudo-entry
 * (user_class "anyone") — it isn't a real account.
 */
interface WireShareUser {
  c_email?: string
  uid?: string
  user_class?: string
  rights?: AddressBookShareUser['rights']
}

function fromWireUserClass(userClass?: string): AddressBookShareUserClass {
  return userClass === USER_CLASS_ANY ? 'any-authenticated-user' : 'normal-user'
}

function wireUserToAddressBookShareUser(
  u: WireShareUser,
  existing?: AddressBookShareUser
): AddressBookShareUser {
  const userClass = fromWireUserClass(u.user_class)
  return {
    uid: u.uid ?? (userClass === 'any-authenticated-user' ? ANY_AUTHENTICATED_UID : ''),
    c_email: u.c_email,
    userClass,
    rights: u.rights ?? {
      can_view: false,
      can_create_objects: false,
      can_edit_objects: false,
      can_erase_objects: false,
    },
    subscribed: existing?.subscribed ?? false,
  }
}

function usersArrayToAddressBookShareData(
  users: AddressBookShareUser[]
): AddressBookShareData {
  const usersRecord: AddressBookShareData['users'] = {}
  for (const u of users) {
    usersRecord[u.uid] = { ...u }
  }
  return { users: usersRecord }
}

const okEnvelope = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await ctx.params
  const all = getDemoData<ShareByAddressBook>(
    req,
    DEMO_ADDRESS_BOOK_SHARE_KEY,
    {}
  )
  return NextResponse.json(okEnvelope(all[book_id] ?? { users: {} }))
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await ctx.params
  const body = (await req.json()) as WireShareUser[]

  const all = getDemoData<ShareByAddressBook>(
    req,
    DEMO_ADDRESS_BOOK_SHARE_KEY,
    {}
  )
  const existingUsers = all[book_id]?.users ?? {}

  const users = Array.isArray(body)
    ? body.map((u) =>
        wireUserToAddressBookShareUser(
          u,
          u.uid ? existingUsers[u.uid] : undefined
        )
      )
    : []
  const data = usersArrayToAddressBookShareData(users)

  all[book_id] = data

  const response = NextResponse.json(okEnvelope(data))
  setDemoData(response, DEMO_ADDRESS_BOOK_SHARE_KEY, all, req)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PUT', 'OPTIONS'] })
}
