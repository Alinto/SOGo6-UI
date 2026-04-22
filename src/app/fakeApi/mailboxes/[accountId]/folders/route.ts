import type { ImapFolder } from '@/features/mails/mails-types'
import { NextRequest, NextResponse } from 'next/server'

import {
  addMailboxDemoFolder,
  getMailboxDemoFolderTree,
} from '@/app/fakeApi/utils/mailbox-demo-folders'

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  _req: NextRequest,
  _ctx: { params: Promise<{ accountId: string }> }
) {
  const tree = getMailboxDemoFolderTree()
  return NextResponse.json(ok(tree))
}

export async function POST(
  req: NextRequest,
  _ctx: { params: Promise<{ accountId: string }> }
) {
  const body = (await req.json()) as { name: string; parent: string }
  const { name, parent } = body
  const path = parent ? `${parent}/${name}` : name
  const newFolder: ImapFolder = {
    path,
    name,
    unseen_count: 0,
    messages: 0,
    flags: ['\\HasNoChildren'],
    delimiter: '/',
    readOnly: false,
    selectable: true,
    subfolders: [],
  }
  addMailboxDemoFolder(newFolder)
  return NextResponse.json(ok(newFolder), { status: 201 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST', 'OPTIONS'] })
}
