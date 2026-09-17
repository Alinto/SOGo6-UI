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
import { Download, FishingHook, Flag, MoreHorizontal, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type MailBulkMoreActionsMenuProps = {
  disabled?: boolean
  showMarkImportant?: boolean
  showRemoveImportant?: boolean
  onMarkImportant?: () => void
  onRemoveImportant?: () => void
  onPhishing: () => void
  onIllegal: () => void
  onDownload: () => void
  triggerClassName?: string
}

export default function MailBulkMoreActionsMenu({
  disabled = false,
  showMarkImportant = false,
  showRemoveImportant = false,
  onMarkImportant,
  onRemoveImportant,
  onPhishing,
  onIllegal,
  onDownload,
  triggerClassName,
}: MailBulkMoreActionsMenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  return (
    <DropdownMenu>
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
              data-testid="mail-bulk-action-btn-more-actions"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('more.string')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        {showMarkImportant && onMarkImportant && (
          <DropdownMenuItem onClick={onMarkImportant}>
            <Star className="mr-2 h-4 w-4" />
            {t('mark_important.string')}
          </DropdownMenuItem>
        )}
        {showRemoveImportant && onRemoveImportant && (
          <DropdownMenuItem onClick={onRemoveImportant}>
            <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
            {t('unmark_important.string')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onPhishing}>
          <FishingHook className="mr-2 h-4 w-4" />
          {t('report_phishing.string')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onIllegal}>
          <Flag className="mr-2 h-4 w-4" />
          {t('report_illegal.string')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t('download.string')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
