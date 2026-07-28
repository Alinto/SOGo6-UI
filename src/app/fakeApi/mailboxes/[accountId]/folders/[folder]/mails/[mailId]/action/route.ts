import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  applyFlagAction,
  buildMailFlagsKey,
  MAIL_FLAGS_COOKIE,
  MailFlagsOverrides,
} from '@/app/fakeApi/utils/mailbox-flags-store'
import { mailDetailByFolderSeed } from '@/app/fakeApi/utils/mailbox-mail-detail-seed'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  ctx: {
    params: Promise<{ accountId: string; folder: string; mailId: string }>
  }
) {
  const { folder, mailId } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const { action, data } = body as {
    action?: string
    data?: string | string[] | null
  }

  if (action === 'tag' || action === 'untag') {
    const overrides = getDemoData<MailFlagsOverrides>(
      req,
      MAIL_FLAGS_COOKIE,
      {}
    )
    const key = buildMailFlagsKey(folder, mailId)
    const seedFlags =
      (
        mailDetailByFolderSeed as Record<
          string,
          { id: string; flags?: string[] }[]
        >
      )[folder]?.find((mail) => String(mail.id) === String(mailId))?.flags ?? []
    const currentFlags = overrides[key] ?? seedFlags
    overrides[key] = applyFlagAction(currentFlags, action, data)

    const response = NextResponse.json({
      error_code: 'S000000',
      error_msg: 'No Error',
    })
    setDemoData(response, MAIL_FLAGS_COOKIE, overrides, req)
    return response
  }

  return NextResponse.json({
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
