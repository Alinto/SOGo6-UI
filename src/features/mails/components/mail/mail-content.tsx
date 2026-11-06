'use client'

import {
  fetchInlineImageDisplayUrls,
  inlineImageFetchTargets,
} from '@/features/mails/utils/inline-image-urls'
import {
  INLINE_IMAGE_PLACEHOLDER,
  prepareMailBodyHtml,
  type InlineImagePart,
} from '@/features/mails/utils/prepare-mail-body-html'
import { useAppSelector } from '@/lib/redux/hooks'
import { useEffect, useMemo, useState } from 'react'
import { AttachmentDisplay } from './mail-attachment'
import { MailShowImage } from './mail-show-image'
import { MailContentProps } from './types'
import {
  containsExternalImages,
  decodeBase64,
  isBase64,
  replaceDataSrcWithSrc,
  ShadowEmailContent,
} from './utils'

export default function MailContent({
  body,
  attachments,
  attachmentsUrl,
}: MailContentProps) {
  const [showImages, setShowImages] = useState(false)
  const token = useAppSelector((state) => state.auth.token)
  const inlineParts = useMemo<InlineImagePart[]>(
    () =>
      (attachments?.parts ?? []).map((part) => ({
        name: part.name,
        contentId: part.contentId,
      })),
    [attachments]
  )
  const targets = useMemo(
    () => inlineImageFetchTargets(body, inlineParts, attachmentsUrl ?? ''),
    [attachmentsUrl, body, inlineParts]
  )
  const targetKey = targets.map((target) => target.url).join('|')
  const [resolved, setResolved] = useState<{
    key: string
    urls: Record<string, string>
  }>({ key: '', urls: {} })

  useEffect(() => {
    if (!targetKey) {
      return
    }
    let cancelled = false
    const created: string[] = []
    void fetchInlineImageDisplayUrls(targets, token, 'blob').then((urls) => {
      if (cancelled) {
        Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
        return
      }
      created.push(...Object.values(urls))
      setResolved({ key: targetKey, urls })
    })
    return () => {
      cancelled = true
      created.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [targetKey, targets, token])

  const hasImages = useMemo(() => {
    let html = body ?? ''
    if (isBase64(html)) {
      html = decodeBase64(html)
    }
    return containsExternalImages(replaceDataSrcWithSrc(html))
  }, [body])

  const pending = targetKey !== '' && resolved.key !== targetKey
  const htmlToRender = prepareMailBodyHtml(body, {
    includeExternalImages: showImages,
    inlineImages: {
      parts: inlineParts.map((part) => {
        const loaded =
          resolved.key === targetKey ? resolved.urls[part.name] : undefined
        const waiting =
          pending && targets.some((target) => target.name === part.name)
        return {
          ...part,
          displayUrl:
            loaded ?? (waiting ? INLINE_IMAGE_PLACEHOLDER : undefined),
        }
      }),
    },
  })

  return (
    <div className="w-full">
      <div className="border-muted my-2 border-t" />

      {attachments && attachments.count > 0 && (
        <AttachmentDisplay
          attachments={attachments}
          attachmentsUrl={attachmentsUrl}
        />
      )}

      {hasImages && !showImages && (
        <MailShowImage onShowImages={() => setShowImages(true)} />
      )}

      <div className="mail-content">
        <ShadowEmailContent html={htmlToRender} />
      </div>
    </div>
  )
}
