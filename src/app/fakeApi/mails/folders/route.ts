import { ImapFolder } from '@/features/mails/mails-types'
import { NextResponse } from 'next/server'

import { nestImapFolderTree } from '@/app/fakeApi/utils/nest-imap-folders'

import folders from './folders.json'

const data = folders as ImapFolder[]

export async function GET() {
  const nestedFolders = nestImapFolderTree(data)
  return NextResponse.json(nestedFolders)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
