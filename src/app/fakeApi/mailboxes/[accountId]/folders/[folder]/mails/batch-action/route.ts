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
    params: Promise<{ accountId: string; folder: string }>
  }
) {
  const { folder } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const { uids, action, data } = body as {
    uids?: (string | number)[]
    action?: string
    data?: string | string[] | null
  }
  const mailUids = (uids ?? []).map(String)

  if (action === 'tag' || action === 'untag') {
    const overrides = getDemoData<MailFlagsOverrides>(
      req,
      MAIL_FLAGS_COOKIE,
      {}
    )
    for (const mailId of mailUids) {
      const key = buildMailFlagsKey(folder, mailId)
      const seedFlags =
        (
          mailDetailByFolderSeed as Record<
            string,
            { id: string; flags?: string[] }[]
          >
        )[folder]?.find((mail) => String(mail.id) === mailId)?.flags ?? []
      const currentFlags = overrides[key] ?? seedFlags
      overrides[key] = applyFlagAction(currentFlags, action, data)
    }

    const response = NextResponse.json({
      data: {
        action,
        mail_uid: mailUids,
        [action === 'tag' ? 'tags_added' : 'tags_removed']: Array.isArray(data)
          ? data
          : data
            ? [data]
            : [],
      },
      error_code: 'S000000',
      error_msg: 'No Error',
    })
    setDemoData(response, MAIL_FLAGS_COOKIE, overrides, req)
    return response
  }

  return NextResponse.json({
    data: {
      action,
      mail_uid: mailUids,
    },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
