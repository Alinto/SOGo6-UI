import { NextRequest, NextResponse } from 'next/server'

import { updateMailboxDemoFolder } from '@/app/fakeApi/utils/mailbox-demo-folders'

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const body = (await req.json()) as { action?: string; data?: string }
  const value = body.data?.trim()

  if ((body.action !== 'rename' && body.action !== 'type') || !value) {
    return NextResponse.json(
      { error_code: 'S000002', error_msg: 'Folder action payload is required' },
      { status: 400 }
    )
  }

  const updated = updateMailboxDemoFolder(folder, {
    ...(body.action === 'rename' ? { name: value } : { type: value }),
  })
  if (!updated) {
    return NextResponse.json(
      { error_code: 'S000306', error_msg: 'Folder cannot be updated' },
      { status: 400 }
    )
  }

  return NextResponse.json(ok(updated))
}
