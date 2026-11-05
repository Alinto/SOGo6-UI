import { SHARED_ADDRESS_BOOKS_CATALOG } from '@/app/fakeApi/utils/shared-address-books-store'
import {
  paginationHeaders,
  sharedOwnersPage,
} from '@/app/fakeApi/utils/shared-owners'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/shared-addressbooks/users?page=&page_size=&search=
 * Paginated list of the users sharing address books with the connected user;
 * `search` matches the owner email or username. Totals are in `X-Pagination`.
 */
export async function GET(req: NextRequest) {
  const { body, pagination } = sharedOwnersPage(
    req.nextUrl.searchParams,
    SHARED_ADDRESS_BOOKS_CATALOG
  )
  return NextResponse.json(body, { headers: paginationHeaders(pagination) })
}
