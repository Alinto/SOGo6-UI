import { NextRequest, NextResponse } from 'next/server'

import {
  buildFolderMessagesListResponse,
  parseMailListFilter,
} from '@/app/fakeApi/utils/mailbox-list-helpers'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const { searchParams } = new URL(req.url)
  const parsedFilter = parseMailListFilter(searchParams.get('filter'))
  if ('error' in parsedFilter) {
    return NextResponse.json({ error: parsedFilter.error }, { status: 400 })
  }
  const body = buildFolderMessagesListResponse(folder, searchParams, req)
  return NextResponse.json(body)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'OPTIONS'] })
}
