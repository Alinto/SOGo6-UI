import { NextRequest, NextResponse } from 'next/server'

import { removeMailboxDemoFolder } from '@/app/fakeApi/utils/mailbox-demo-folders'

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const removed = removeMailboxDemoFolder(folder)
  if (!removed) {
    return NextResponse.json(
      { error_code: 'S000001', error_msg: 'Folder not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['DELETE', 'OPTIONS'] })
}
