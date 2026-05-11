import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { getCachedEnvVars } from '@/lib/env-service'
import { cn } from '@/lib/utils'
import { ArrowDownToLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  AttachmentNameProps,
  ImapAttachments,
  MailAttachmentProps,
} from './types'
import { formatSize, getFileExtension } from './utils'

// Retrieve the base URL once at module load
const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    const envVars = getCachedEnvVars()
    const fromEnv = envVars?.REACT_APP_API_BASE_URL

    // Fallback to localhost:5000 if not defined or if it's /fakeApi
    return fromEnv && fromEnv !== '/fakeApi' ? fromEnv : 'http://localhost:5000'
  }
  return 'http://localhost:5000'
})()

/**
 * Builds the complete URL for an attachment
 * If the URL is relative, adds the API base URL
 * Properly encodes special characters (spaces, accents, etc.)
 *
 * @param uri - Attachment URI (relative or absolute)
 * @returns Complete URL to download the attachment
 */
function buildAttachmentUrl(uri: string): string {
  // Edge case: Empty or undefined URI
  if (!uri) {
    return ''
  }

  // If the URL is already absolute (http:// or https://), return it as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }

  // If the URL is relative to /fakeApi, return it as is (Next.js route)
  if (uri.startsWith('/fakeApi')) {
    return uri
  }
  
  // Normalize the base URL (remove trailing slash)
  const normalizedBase = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL
  
  // Normalize the URI (remove leading slash)
  const normalizedUri = uri.startsWith('/') 
    ? uri.slice(1) 
    : uri
  
  // Encode each path segment separately to handle special characters
  // This preserves "/" but encodes spaces, accents, apostrophes, etc.
  const segments = normalizedUri.split('/')
  const encodedSegments = segments.map(segment => encodeURIComponent(segment))
  const encodedUri = encodedSegments.join('/')
  
  const result = `${normalizedBase}/${encodedUri}`

  return result
}

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

export function MailAttachment({ part, className = '' }: MailAttachmentProps) {
  const t = useTranslations('MAILS_COMMONS')
  
  // If no downloadUri, display just the name (no link)
  if (!part.downloadUri) {
    return (
      <div
        className={cn(
          'bg-muted/50 relative flex max-w-md min-w-0 items-center rounded px-2 py-1 text-xs',
          className
        )}
      >
        <AttachmentName name={part.name} className="flex-1 truncate" />
        <span className="text-muted-foreground ml-1 shrink-0 text-xs">
          {formatSize(part.size)}
        </span>
      </div>
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
        {/* Use native <a> tag instead of Next.js Link for downloads */}
        <a
          href={buildAttachmentUrl(part.downloadUri)}
          download={part.name}
          target="_blank"
          rel="noopener noreferrer"
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
            className="bg-muted hover:bg-card shrink-0 rounded px-3 py-1 text-xs inline-flex items-center justify-center"
            aria-label={t('mail_display.content.download_all_attachments.string')}
          >
            <ArrowDownToLine size={22} />
          </a>
        </TooltipWrapper>
      )}
    </div>
  )
}
