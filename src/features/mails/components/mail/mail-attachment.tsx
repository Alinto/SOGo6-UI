import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ArrowDownToLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import {
  AttachmentNameProps,
  ImapAttachments,
  MailAttachmentProps,
} from './types'
import { formatSize, getFileExtension } from './utils'

export function AttachmentName({
  name,
  maxLength = 20,
  className = '',
}: AttachmentNameProps) {
  const isLong = name.length > maxLength
  const ext = getFileExtension(name)
  let displayName = name
  if (isLong) {
    const baseName = ext ? name.slice(0, -(ext.length + 1)) : name
    displayName = baseName.slice(0, maxLength) + '... ' + (ext ? ext : '')
  }

  if (!isLong) {
    return <span className={className}>{name}</span>
  }

  return (
    <TooltipWrapper content={name} side="top">
      <span className={`${className} cursor-pointer`} tabIndex={0}>
        {displayName}
      </span>
    </TooltipWrapper>
  )
}

export function MailAttachment({ part, className = '' }: MailAttachmentProps) {
  const t = useTranslations('MAILS_COMMONS')
  return (
    <div
      className={cn(
        'bg-muted/50 relative flex max-w-md min-w-0 items-center rounded px-2 py-1 text-xs',
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        <AttachmentName name={part.name} />
      </span>
      <span className="text-muted-foreground ml-1 shrink text-xs">
        {formatSize(part.size)}
      </span>
      <TooltipWrapper
        content={t('mail_display.content.download_attachment.string')}
        side="top"
      >
        <Link
          href={part.downloadUri}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 shrink"
          aria-label={t('mail_display.content.download_attachment.string')}
        >
          <ArrowDownToLine size={20} />
        </Link>
      </TooltipWrapper>
    </div>
  )
}

export function AttachmentDisplay({
  attachments,
}: {
  attachments: ImapAttachments
}) {
  const t = useTranslations('MAILS_COMMONS')
  const [showAll, setShowAll] = useState(false)
  if (!attachments || !attachments.parts || attachments.parts.length === 0) {
    return null
  }

  const MAX_DISPLAY = 5
  const total = attachments.parts.length
  const hiddenCount = total - MAX_DISPLAY
  const displayedParts = showAll
    ? attachments.parts
    : attachments.parts.slice(0, MAX_DISPLAY)
  const plusUndisplayElement = '+'

  return (
    <div className="mb-2 flex flex-row flex-wrap items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {displayedParts.map((part) => (
          <MailAttachment key={part.partId} part={part} />
        ))}

        {!showAll && hiddenCount > 0 && (
          <Button
            type="button"
            className="bg-muted hover:bg-card cursor-pointer rounded border px-3 py-1 text-xs"
            onClick={() => setShowAll(true)}
          >
            {plusUndisplayElement}
            {hiddenCount}
          </Button>
        )}
      </div>
      {attachments.zipUri && attachments.parts.length > 1 && (
        <TooltipWrapper
          content={t('mail_display.content.download_all_attachments.string')}
          side="top"
        >
          <Link
            href={attachments.zipUri}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-muted hover:bg-card shrink rounded px-3 py-1 text-xs"
            aria-label={t(
              'mail_display.content.download_all_attachments.string'
            )}
          >
            <ArrowDownToLine size={22} />
          </Link>
        </TooltipWrapper>
      )}
    </div>
  )
}
