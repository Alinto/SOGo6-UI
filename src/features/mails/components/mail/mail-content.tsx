import { prepareMailBodyHtml } from '@/features/mails/utils/prepare-mail-body-html'
import { useMemo, useState } from 'react'
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

export default function MailContent({ body, attachments }: MailContentProps) {
  const [showImages, setShowImages] = useState(false)

  const hasImages = useMemo(() => {
    let html = body ?? ''
    if (isBase64(html)) {
      html = decodeBase64(html)
    }
    return containsExternalImages(replaceDataSrcWithSrc(html))
  }, [body])

  const htmlToRender = prepareMailBodyHtml(body, {
    includeExternalImages: showImages,
  })

  return (
    <div className="w-full">
      <div className="border-muted my-2 border-t" />

      {attachments && attachments.count > 0 && (
        <AttachmentDisplay attachments={attachments} />
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
