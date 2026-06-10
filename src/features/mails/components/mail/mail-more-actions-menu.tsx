'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Archive,
  Download,
  FileCode,
  Flame,
  FolderInput,
  Inbox,
  Mail,
  MoreHorizontal,
  Printer,
  Tag,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

export type MailMoreActionsMenuProps = {
  disabled?: boolean
  isJunk?: boolean
  markUnreadDisabled?: boolean
  labelDisabled?: boolean
  showSpamActions?: boolean
  showUnread?: boolean
  showLabel?: boolean
  showArchive?: boolean
  showDownload?: boolean
  showMove?: boolean
  showPrint?: boolean
  showViewSource?: boolean
  onMarkSpam?: () => void
  onMarkHam?: () => void
  onMarkUnread?: () => void
  onLabel?: () => void
  onArchive?: () => void
  onDownload?: () => void
  onMove?: () => void
  onPrint?: () => void
  printDisabled?: boolean
  onViewSource?: () => void
  triggerClassName?: string
}

export default function MailMoreActionsMenu({
  disabled = false,
  isJunk = false,
  markUnreadDisabled = false,
  labelDisabled = false,
  showSpamActions = true,
  showUnread = true,
  showLabel = true,
  showArchive = false,
  showDownload = false,
  showMove = false,
  showPrint = false,
  showViewSource = false,
  onMarkSpam,
  onMarkHam,
  onMarkUnread,
  onLabel,
  onArchive,
  onDownload,
  onMove,
  onPrint,
  printDisabled = false,
  onViewSource,
  triggerClassName,
}: MailMoreActionsMenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={triggerClassName}
          aria-label={t('more.string')}
          data-testid="mail-action-btn-more-actions"
        >
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {showSpamActions && isJunk && onMarkHam && (
          <DropdownMenuItem onClick={onMarkHam}>
            <Inbox className="mr-2 h-4 w-4" />
            {t('move_to_inbox.string')}
          </DropdownMenuItem>
        )}
        {showSpamActions && !isJunk && onMarkSpam && (
          <DropdownMenuItem onClick={onMarkSpam}>
            <Flame className="mr-2 h-4 w-4" />
            {t('report_spam.string')}
          </DropdownMenuItem>
        )}
        {showUnread && onMarkUnread && (
          <DropdownMenuItem
            disabled={markUnreadDisabled}
            onClick={onMarkUnread}
          >
            <Mail className="mr-2 h-4 w-4" />
            {t('mark_unread.string')}
          </DropdownMenuItem>
        )}
        {showLabel && onLabel && (
          <DropdownMenuItem disabled={labelDisabled} onClick={onLabel}>
            <Tag className="mr-2 h-4 w-4" />
            {t('label.string')}
          </DropdownMenuItem>
        )}
        {showArchive && onArchive && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {t('archive.string')}
          </DropdownMenuItem>
        )}
        {showDownload && onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t('download.string')}
          </DropdownMenuItem>
        )}
        {showMove && onMove && (
          <DropdownMenuItem onClick={onMove}>
            <FolderInput className="mr-2 h-4 w-4" />
            {t('move.string')}
          </DropdownMenuItem>
        )}
        {showPrint && onPrint && (
          <DropdownMenuItem disabled={printDisabled} onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('print.string')}
          </DropdownMenuItem>
        )}
        {showViewSource && onViewSource && (
          <DropdownMenuItem onClick={onViewSource}>
            <FileCode className="mr-2 h-4 w-4" />
            {t('view_source.string')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
