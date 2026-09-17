'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Download,
  FileCode,
  FishingHook,
  Flag,
  Inbox,
  Mail,
  MoreHorizontal,
  Printer,
  ShieldX,
  Tag,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  MailMoveCopySubmenu,
  useMailMoveCopyDestinations,
  type MailMoveCopyMenuMode,
} from './mail-move-copy-destinations'
import type { Action } from './types'

export type MailMoreActionsMenuProps = {
  disabled?: boolean
  isJunk?: boolean
  markUnreadDisabled?: boolean
  labelDisabled?: boolean
  showSpamActions?: boolean
  showUnread?: boolean
  showLabel?: boolean
  showDownload?: boolean
  showMoveCopy?: boolean
  showPrint?: boolean
  showViewSource?: boolean
  folderSpecificActions?: Action[]
  accountId?: string
  currentFolder?: string
  onMarkSpam?: () => void
  onMarkHam?: () => void
  onMarkUnread?: () => void
  onLabel?: () => void
  onFolderSpecificAction?: (action: Action) => void
  onPhishing?: () => void
  onIllegal?: () => void
  onDownload?: () => void
  onSelectDestination?: (
    mode: MailMoveCopyMenuMode,
    destination: string
  ) => void
  onCreateFolder?: (mode: MailMoveCopyMenuMode) => void
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
  showSpamActions = false,
  showUnread = false,
  showLabel = false,
  showDownload = false,
  showMoveCopy = false,
  showPrint = false,
  showViewSource = false,
  folderSpecificActions = [],
  accountId = '',
  currentFolder = '',
  onMarkSpam,
  onMarkHam,
  onMarkUnread,
  onLabel,
  onFolderSpecificAction,
  onPhishing,
  onIllegal,
  onDownload,
  onSelectDestination,
  onCreateFolder,
  onPrint,
  printDisabled = false,
  onViewSource,
  triggerClassName,
}: MailMoreActionsMenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const [open, setOpen] = useState(false)
  const moveCopyOptions = useMailMoveCopyDestinations(
    accountId,
    currentFolder,
    !open || !showMoveCopy
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>{t('more.string')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        {showSpamActions && isJunk && onMarkHam && (
          <DropdownMenuItem onClick={onMarkHam}>
            <Inbox className="mr-2 h-4 w-4" />
            {t('report_not_spam.string')}
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
        {folderSpecificActions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            disabled={action.disabled}
            onClick={() => onFolderSpecificAction?.(action)}
          >
            <span className="mr-2 inline-flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
              {action.icon}
            </span>
            {action.title}
          </DropdownMenuItem>
        ))}
        {showMoveCopy && onSelectDestination && onCreateFolder && (
          <>
            <MailMoveCopySubmenu
              mode="move"
              options={moveCopyOptions}
              onSelectDestination={onSelectDestination}
              onCreateFolder={onCreateFolder}
              triggerTestId="mail-action-more-move-submenu"
            />
            <MailMoveCopySubmenu
              mode="copy"
              options={moveCopyOptions}
              onSelectDestination={onSelectDestination}
              onCreateFolder={onCreateFolder}
              triggerTestId="mail-action-more-copy-submenu"
            />
          </>
        )}
        {showPrint && onPrint && (
          <DropdownMenuItem disabled={printDisabled} onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('print.string')}
          </DropdownMenuItem>
        )}
        {showSpamActions && !isJunk && onMarkSpam && (
          <DropdownMenuItem onClick={onMarkSpam}>
            <ShieldX className="mr-2 h-4 w-4" />
            {t('report_spam.string')}
          </DropdownMenuItem>
        )}
        {onPhishing && (
          <DropdownMenuItem onClick={onPhishing}>
            <FishingHook className="mr-2 h-4 w-4" />
            {t('report_phishing.string')}
          </DropdownMenuItem>
        )}
        {onIllegal && (
          <DropdownMenuItem onClick={onIllegal}>
            <Flag className="mr-2 h-4 w-4" />
            {t('report_illegal.string')}
          </DropdownMenuItem>
        )}
        {showDownload && onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t('download.string')}
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
