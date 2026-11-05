import { setDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  SHARED_ADDRESS_BOOKS_CATALOG,
  SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY,
  getSubscribedAddressBookKeys,
} from '@/app/fakeApi/utils/shared-address-books-store'
import { decodeOwnerParam } from '@/app/fakeApi/utils/shared-owners'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/shared-addressbooks/{owner}
 * Every address book `owner` shares with the connected user (not paginated).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const owner = decodeOwnerParam((await params).key)
  const subscribed = new Set(getSubscribedAddressBookKeys(req))
  const addressbooks = SHARED_ADDRESS_BOOKS_CATALOG.filter(
    (book) => book.owner === owner
  ).map((book) => ({ ...book, subscribed: subscribed.has(book.key) }))

  return NextResponse.json({
    data: { addressbooks },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

/**
 * PUT /fakeApi/shared-addressbooks/{key}  body: { subscribe: 1 | 0 }
 * Subscribes to (1) or unsubscribes from (0) a shared address book. Only the
 * subscribed keys are stored; GET /fakeApi/address_books rebuilds the
 * subscriptions from them.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const body = (await req.json().catch(() => ({}))) as { subscribe?: unknown }
  if (body.subscribe !== 0 && body.subscribe !== 1) {
    return NextResponse.json(
      { error_code: 'BAD_REQUEST', error_msg: 'subscribe must be 0 or 1' },
      { status: 400 }
    )
  }

  const book = SHARED_ADDRESS_BOOKS_CATALOG.find((b) => b.key === key)
  if (!book) {
    return NextResponse.json(
      { error_code: 'NOT_FOUND', error_msg: 'Address book not found' },
      { status: 404 }
    )
  }

  const subscribe = body.subscribe === 1
  const otherKeys = getSubscribedAddressBookKeys(req).filter((k) => k !== key)

  const response = NextResponse.json({
    data: { ...book, subscribed: subscribe },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
  setDemoData(
    response,
    SUBSCRIBED_ADDRESS_BOOKS_STORAGE_KEY,
    subscribe ? [...otherKeys, key] : otherKeys,
    req
  )
  return response
}
