import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useFormatSize } from '@/features/mails/hooks/use-format-size'
import { useDownloadFile } from '@/hooks/use-download-file'
import { cn } from '@/lib/utils'
import { ArrowDownToLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ImapAttachments, MailAttachmentProps } from './types'
import {
  buildAttachmentUrl,
  getAttachmentType,
  splitFileNameTail,
  truncateFileNameMiddle,
} from './utils'

export function MailAttachment({
  part,
  className = '',
  attachmentsUrl = '',
}: MailAttachmentProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { downloadFile, isDownloading } = useDownloadFile()
  const formatSize = useFormatSize()
  const attachmentUrl = buildAttachmentUrl(`${attachmentsUrl}${part.name}`)
  const fileType = getAttachmentType(part.name, part.contentType)
  const displayName = truncateFileNameMiddle(part.name)
  // The extension (with the last character before it) never wraps.
  const { head, tail } = splitFileNameTail(displayName)
  const nameContent = (
    <>
      {head}
      {tail && <span className="whitespace-nowrap">{tail}</span>}
    </>
  )

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    downloadFile(attachmentUrl, part.name, {
      title: 'mail_attachment.download_error.title.string',
      message: 'mail_attachment.download_error.message.string',
    })
  }

  return (
    <div
      className={cn(
        'bg-muted/50 flex w-60 max-w-full min-w-0 flex-col justify-between gap-2 rounded-md border p-2 text-xs',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        {fileType && (
          <span className="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold">
            {fileType}
          </span>
        )}
        {displayName === part.name ? (
          <span className="min-w-0 break-all" data-testid="attachment-name">
            {nameContent}
          </span>
        ) : (
          <TooltipWrapper content={part.name} side="top">
            {/* Screen readers get the full name, sighted users the short one. */}
            <span className="min-w-0 cursor-default break-all" tabIndex={0}>
              <span aria-hidden data-testid="attachment-name">
                {nameContent}
              </span>
              <span className="sr-only">{part.name}</span>
            </span>
          </TooltipWrapper>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{formatSize(part.size)}</span>
        <TooltipWrapper
          content={t('mail_display.content.download_attachment.string')}
          side="top"
        >
          <a
            href={attachmentUrl}
            onClick={handleDownload}
            aria-disabled={isDownloading}
            className={cn(
              'hover:bg-card hover:text-primary inline-flex shrink-0 items-center justify-center rounded p-1',
              isDownloading && 'pointer-events-none opacity-50'
            )}
            aria-label={t(
              'mail_display.content.download_attachment_named.string',
              {
                name: part.name,
              }
            )}
          >
            <ArrowDownToLine size={16} aria-hidden />
          </a>
        </TooltipWrapper>
      </div>
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
