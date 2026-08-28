'use client'

import type { MailComposeAttachment } from '@/features/mails/store/mail-compose-slice'
import { createDraft } from '@/features/mails/store/mail-compose-slice'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { parseMailto } from '../share/parse-mailto'
import { consumePendingShare } from '../share/pending-share'

function filesToAttachments(
  draftId: string,
  files: { name: string; type: string; blob: Blob }[]
): MailComposeAttachment[] {
  return files.map((file) => ({
    draftId,
    name: file.name,
    size: file.blob.size,
    type: file.type,
    file: new File([file.blob], file.name, { type: file.type }),
    uploadStatus: 'pending',
  }))
}

/**
 * Manifest shortcuts, share target, and mailto: protocol handler.
 * Lives in the logged-in layout so it works even when the folder page is not mounted.
 */
export function useComposeDeepLink() {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  useEffect(() => {
    const compose = searchParams.get('compose') === '1'
    const share = searchParams.get('share') === '1'
    const mailtoRaw = searchParams.get('mailto')
    if (!compose && !share && !mailtoRaw) return

    let cancelled = false

    void (async () => {
      const draftId = createClientId()
      let to: { email: string; name?: string }[] = []
      let subject = searchParams.get('subject') ?? ''
      let body = searchParams.get('body') ?? ''
      let attachments: MailComposeAttachment[] = []

      const toParam = searchParams.get('to')
      if (toParam) {
        to = toParam
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .map((email) => ({ email }))
      }

      if (mailtoRaw) {
        const parsed = parseMailto(mailtoRaw)
        if (parsed.to.length) to = parsed.to
        if (parsed.subject) subject = parsed.subject
        if (parsed.body) body = parsed.body
      }

      if (share) {
        const pending = await consumePendingShare()
        if (pending) {
          if (pending.to) to = [{ email: pending.to }]
          if (pending.subject) subject = pending.subject
          const extra = [pending.body, pending.url].filter(Boolean).join('\n')
          if (extra) body = body ? `${body}\n${extra}` : extra
          if (pending.files.length) {
            attachments = filesToAttachments(draftId, pending.files)
          }
        }
      }

      if (cancelled) return

      dispatch(
        createDraft({
          draftId,
          initialData: {
            to,
            subject,
            body,
            attachments,
          },
        })
      )

      const params = new URLSearchParams(searchParams.toString())
      params.delete('compose')
      params.delete('share')
      params.delete('mailto')
      params.delete('to')
      params.delete('subject')
      params.delete('body')
      const query = params.toString()
      replace(query ? `${pathname}?${query}` : pathname)
    })()

    return () => {
      cancelled = true
    }
  }, [dispatch, pathname, replace, searchParams])
}
