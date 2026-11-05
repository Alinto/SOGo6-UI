import { SHARED_CALENDARS_CATALOG } from '@/app/fakeApi/utils/shared-calendars-store'
import {
  paginationHeaders,
  sharedOwnersPage,
} from '@/app/fakeApi/utils/shared-owners'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /fakeApi/shared-calendars/users?page=&page_size=&search=
 * Paginated list of the users sharing calendars with the connected user;
 * `search` matches the owner email or username. Totals are in `X-Pagination`.
 */
export async function GET(req: NextRequest) {
  const { body, pagination } = sharedOwnersPage(
    req.nextUrl.searchParams,
    SHARED_CALENDARS_CATALOG
  )
  return NextResponse.json(body, { headers: paginationHeaders(pagination) })
}
