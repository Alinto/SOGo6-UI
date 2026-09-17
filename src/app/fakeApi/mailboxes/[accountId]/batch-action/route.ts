import { getDemoData, setDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  applyFlagAction,
  buildMailFlagsKey,
  MAIL_FLAGS_COOKIE,
  MailFlagsOverrides,
} from '@/app/fakeApi/utils/mailbox-flags-store'
import { mailDetailByFolderSeed } from '@/app/fakeApi/utils/mailbox-mail-detail-seed'
import {
  MAIL_MOVES_COOKIE,
  MailMoveOverrides,
} from '@/app/fakeApi/utils/mailbox-move-store'
import { NextRequest, NextResponse } from 'next/server'

const JUNK_FOLDER = 'Junk'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { uids, action, data } = body as {
    uids?: Record<string, (string | number)[]>
    action?: string
    data?: string | string[] | null
  }

  const uidsByFolder = Object.entries(uids ?? {}).map(
    ([folder, uids]) => [folder, (uids ?? []).map(String)] as const
  )
  const allMailUids = uidsByFolder.flatMap(([, uids]) => uids)

  if (action === 'tag' || action === 'untag') {
    const overrides = getDemoData<MailFlagsOverrides>(
      req,
      MAIL_FLAGS_COOKIE,
      {}
    )
    for (const [folder, mailUids] of uidsByFolder) {
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
    }

    const response = NextResponse.json({
      data: {
        action,
        mail_uid: allMailUids,
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

  if (action === 'phishing' || action === 'illegal') {
    const moveOverrides = getDemoData<MailMoveOverrides>(
      req,
      MAIL_MOVES_COOKIE,
      {}
    )
    for (const mailId of allMailUids) {
      moveOverrides[mailId] = JUNK_FOLDER
    }

    const response = NextResponse.json({
      data: {
        action,
        mail_uid: allMailUids,
      },
      error_code: 'S000000',
      error_msg: 'No Error',
    })
    setDemoData(response, MAIL_MOVES_COOKIE, moveOverrides, req)
    return response
  }

  return NextResponse.json({
    data: {
      action,
      mail_uid: allMailUids,
    },
    error_code: 'S000000',
    error_msg: 'No Error',
  })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
