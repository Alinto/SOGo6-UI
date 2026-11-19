import { NextRequest, NextResponse } from 'next/server'

import {
  getMailboxDemoFolderTree,
  removeMailboxDemoFolder,
  updateMailboxDemoFolder,
} from '@/app/fakeApi/utils/mailbox-demo-folders'
import type { ImapFolder } from '@/features/mails/mails-types'

function findDemoFolder(
  folders: ImapFolder[],
  path: string
): ImapFolder | undefined {
  for (const folder of folders) {
    if (folder.path === path) return folder
    const found = findDemoFolder(
      folder.subfolders ?? folder.children ?? [],
      path
    )
    if (found) return found
  }
  return undefined
}

const ok = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const found = findDemoFolder(getMailboxDemoFolderTree(), folder)
  if (!found) {
    return NextResponse.json(
      { error_code: 'S000001', error_msg: 'Folder not found' },
      { status: 404 }
    )
  }
  return NextResponse.json(
    ok({ ...found, subfolders: undefined, children: [] })
  )
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
  return NextResponse.json(ok(null))
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const body = (await req.json()) as { name?: string; type?: string }
  const newName = body.name?.trim()
  const folderType = body.type?.trim()

  if (!newName && !folderType) {
    return NextResponse.json(
      { error_code: 'S000002', error_msg: 'Folder update payload is required' },
      { status: 400 }
    )
  }

  const updated = updateMailboxDemoFolder(folder, {
    ...(newName ? { name: newName } : {}),
    ...(folderType ? { type: folderType } : {}),
  })
  if (!updated) {
    return NextResponse.json(
      {
        error_code: 'S000306',
        error_msg: 'Folder cannot be updated',
      },
      { status: 400 }
    )
  }

  return NextResponse.json(ok(updated))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'DELETE', 'PATCH', 'OPTIONS'] })
}
