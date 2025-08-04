import { useState } from 'react'
import { AttachmentDisplay } from './mail-attachment'
import { MailShowImage } from './mail-show-image'
import { MailContentProps } from './types'
import {
  blockExternalImages,
  containsExternalImages,
  decodeBase64,
  isBase64,
  replaceDataSrcWithSrc,
  ShadowEmailContent,
} from './utils'

export default function MailContent({ body, attachments }: MailContentProps) {
  const [showImages, setShowImages] = useState(false)

  let html = body
  if (isBase64(html)) {
    html = decodeBase64(html)
  }

  html = replaceDataSrcWithSrc(html)
  const hasImages = containsExternalImages(html)

  const htmlToRender = showImages ? html : blockExternalImages(html)

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
