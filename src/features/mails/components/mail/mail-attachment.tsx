import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDownloadFile } from '@/hooks/use-download-file'
import { cn } from '@/lib/utils'
import { ArrowDownToLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  AttachmentNameProps,
  ImapAttachments,
  MailAttachmentProps,
} from './types'
import { buildAttachmentUrl, formatSize, getFileExtension } from './utils'

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
    displayName = baseName.slice(0, maxLength) + '...' + (ext ? '.' + ext : '')
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

export function MailAttachment({
  part,
  className = '',
  attachmentsUrl = '',
}: MailAttachmentProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { downloadFile, isDownloading } = useDownloadFile()

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    downloadFile(
      buildAttachmentUrl(`${attachmentsUrl}${part.name}`),
      part.name,
      {
        title: t('mail_display.content.download_error.title.string'),
        message: t('mail_display.content.download_error.message.string'),
      }
    )
  }

  return (
    <div
      className={cn(
        'bg-muted/50 relative flex max-w-md min-w-0 items-center rounded px-2 py-1 text-xs',
        className
      )}
    >
      <TooltipWrapper
        content={t('mail_display.content.download_attachment.string')}
        side="top"
      >
        <a
          href={buildAttachmentUrl(`${attachmentsUrl}${part.name}`)}
          onClick={handleDownload}
          aria-disabled={isDownloading}
          className="min-w-0 flex-1 truncate underline hover:underline"
          aria-label={t('mail_display.content.download_attachment.string')}
        >
          <AttachmentName name={part.name} />
        </a>
      </TooltipWrapper>
      <span className="text-muted-foreground ml-1 shrink-0 text-xs">
        {formatSize(part.size)}
      </span>
    </div>
  )
}

export function AttachmentDisplay({
  attachments,
  attachmentsUrl,
}: {
  attachments: ImapAttachments
  attachmentsUrl: string
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

  return (
    <div className="mb-2 flex flex-row flex-wrap items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {displayedParts.map((part) => (
          <MailAttachment
            key={part.partId}
            part={part}
            attachmentsUrl={attachmentsUrl}
          />
        ))}

        {!showAll && hiddenCount > 0 && (
          <Button
            type="button"
            className="bg-muted hover:bg-card cursor-pointer rounded border px-3 py-1 text-xs"
            onClick={() => setShowAll(true)}
          >
            {t('mail_display.content.more_attachments_count.string', {
              count: hiddenCount,
            })}
          </Button>
        )}
      </div>

      {attachments.zipUri && attachments.parts.length > 1 && (
        <TooltipWrapper
          content={t('mail_display.content.download_all_attachments.string')}
          side="top"
        >
          {/* Use native <a> tag instead of Next.js Link for downloads */}
          <a
            href={buildAttachmentUrl(attachments.zipUri)}
            download="attachments.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-muted hover:bg-card inline-flex shrink-0 items-center justify-center rounded px-3 py-1 text-xs"
            aria-label={t(
              'mail_display.content.download_all_attachments.string'
            )}
          >
            <ArrowDownToLine size={22} />
          </a>
        </TooltipWrapper>
      )}
    </div>
  )
}
