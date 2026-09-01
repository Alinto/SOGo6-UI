'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FeatureIncoming from '@/features/mails/components/sidebars/fast-access/content/feature-incoming'
import {
  Archive,
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
  showArchive?: boolean
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
  onArchive?: () => void
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
  showArchive = false,
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
  onArchive,
  onDownload,
  onSelectDestination,
  onCreateFolder,
  onPrint,
  printDisabled = false,
  onViewSource,
  triggerClassName,
}: MailMoreActionsMenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const moveCopyOptions = useMailMoveCopyDestinations(
    accountId,
    currentFolder,
    !open || !showMoveCopy
  )

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
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
          {showViewSource && onViewSource && (
            <DropdownMenuItem onClick={onViewSource}>
              <FileCode className="mr-2 h-4 w-4" />
              {t('view_source.string')}
            </DropdownMenuItem>
          )}
          {showSpamActions && !isJunk && onMarkSpam && (
            <DropdownMenuItem onClick={onMarkSpam}>
              <ShieldX className="mr-2 h-4 w-4" />
              {t('report_spam.string')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setComingSoonOpen(true)}>
            <FishingHook className="mr-2 h-4 w-4" />
            {t('report_phishing.string')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setComingSoonOpen(true)}>
            <Flag className="mr-2 h-4 w-4" />
            {t('report_illegal.string')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <DialogContent>
          <FeatureIncoming />
        </DialogContent>
      </Dialog>
    </>
  )
}
