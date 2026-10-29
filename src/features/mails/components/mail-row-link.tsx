'use client'

import { useOpenDraftOnClick } from '@/features/mails/hooks/use-open-draft-on-click'
import type { ImapFolderType } from '@/features/mails/mails-types'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

interface MailRowLinkOptions {
  folderType?: ImapFolderType
  mailFolderPath: string
  accountId: string
  mailId: string
  onOpenMail?: (id: string, folder: string) => void | Promise<void>
  shouldIgnoreClick?: () => boolean
}

export function useMailRowLink({
  folderType,
  mailFolderPath,
  accountId,
  mailId,
  onOpenMail,
  shouldIgnoreClick,
}: MailRowLinkOptions) {
  const { openDraftIfNeeded } = useOpenDraftOnClick()
  const href = `/u/${accountId}/${encodeURIComponent(mailFolderPath)}/${mailId}`

  const onClick = useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (shouldIgnoreClick?.()) {
        event.preventDefault()
        return
      }
      const openedDraft = await openDraftIfNeeded({
        folderType,
        folderPath: mailFolderPath,
        accountId,
        mailId,
      })
      if (openedDraft) {
        event.preventDefault()
        return
      }
      if (onOpenMail) {
        event.preventDefault()
        await onOpenMail(String(mailId), mailFolderPath)
      }
    },
    [
      accountId,
      folderType,
      mailFolderPath,
      mailId,
      onOpenMail,
      openDraftIfNeeded,
      shouldIgnoreClick,
    ]
  )

  return { href, onClick }
}

export function MailRowStatus({
  seen,
  hasAttachment,
  priority = null,
  hasEvent = false,
  hasContact = false,
  answered = false,
  forwarded = false,
}: {
  seen: boolean
  hasAttachment: boolean
  priority?: 'high' | 'highest' | null
  hasEvent?: boolean
  hasContact?: boolean
  answered?: boolean
  forwarded?: boolean
}) {
  const t = useTranslations('MAILS_LIST')
  return (
    <>
      {!seen && <span className="sr-only">{t('row.unread.string')}</span>}
      {hasAttachment && (
        <span className="sr-only">{t('row.attachment.string')}</span>
      )}
      {priority === 'highest' && (
        <span className="sr-only">{t('priority.highest.string')}</span>
      )}
      {priority === 'high' && (
        <span className="sr-only">{t('priority.high.string')}</span>
      )}
      {hasEvent && (
        <span className="sr-only">{t('row.invitation.string')}</span>
      )}
      {hasContact && <span className="sr-only">{t('row.contact.string')}</span>}
      {answered && <span className="sr-only">{t('row.replied.string')}</span>}
      {forwarded && (
        <span className="sr-only">{t('row.forwarded.string')}</span>
      )}
    </>
  )
}

export function MailFlagButton({
  flagged,
  onToggle,
  disabled = false,
  className,
  iconClassName,
}: {
  flagged: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
  iconClassName?: string
}) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  return (
    <button
      type="button"
      aria-pressed={flagged}
      aria-label={
        flagged ? t('unmark_important.string') : t('mark_important.string')
      }
      disabled={disabled}
      className={cn('order-2 inline-flex shrink-0 items-center', className)}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!disabled) onToggle()
      }}
    >
      <Star
        aria-hidden
        fill={flagged ? 'yellow' : 'white'}
        strokeWidth={1}
        className={cn(
          'h-4 w-4 transition-all duration-200 hover:h-5 hover:w-5',
          disabled ? 'cursor-default' : 'cursor-pointer',
          iconClassName
        )}
      />
    </button>
  )
}

export const MailRowAnchor = Link
