import { NextRequest, NextResponse } from 'next/server'

import { mailDetailByFolderSeed } from '@/app/fakeApi/utils/mailbox-mail-detail-seed'
import { normalizeDemoMailDetail } from '@/app/fakeApi/utils/mailbox-mail-detail-normalize'

const okEnvelope = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

const notFoundEnvelope = () => ({
  data: null,
  error_code: 'S000300' as const,
  error_msg: 'Mail not found' as const,
})

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string; mailId: string }> }
) {
  const { folder, mailId } = await ctx.params
  const folderMessages = mailDetailByFolderSeed[folder] || []
  const raw = folderMessages.find((msg) => String(msg.id) === String(mailId))

  if (!raw) {
    return NextResponse.json(notFoundEnvelope(), { status: 404 })
  }

  const normalized = normalizeDemoMailDetail(raw)
  return NextResponse.json(okEnvelope(normalized))
}

export async function DELETE(
  _req: NextRequest,
  _ctx: { params: Promise<{ accountId: string; folder: string; mailId: string }> }
) {
  return NextResponse.json({
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'DELETE', 'OPTIONS'] })
}
