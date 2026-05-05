import { NextRequest, NextResponse } from 'next/server'

import { removeMailboxDemoFolder } from '@/app/fakeApi/utils/mailbox-demo-folders'

const data = {
  data: {
    certificates: {},
    id: '0',
    identities: [
      {
        isDefault: true,
        mail: 'sogo-tests1@example.org',
        name: 'John Paul',
        replyTo: 'sogo-tests1@example.org',
        signatures: {},
      },
    ],
    receipts: {},
  },
  error_code: 'S000000',
  error_msg: 'No Error',
}
export async function GET() {
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`PATCH /fakeApi/mailboxes/${params.id} body:`, await req.json())
  return NextResponse.json(data, { status: 200 })
}

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
  return NextResponse.json({ allow: ['GET', 'DELETE', 'OPTIONS'] })
}
