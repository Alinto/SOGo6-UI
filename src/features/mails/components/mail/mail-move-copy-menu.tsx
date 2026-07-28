'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderInput } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  MailMoveCopySubmenu,
  useMailMoveCopyDestinations,
  type MailMoveCopyMenuMode,
} from './mail-move-copy-destinations'

export type { MailMoveCopyMenuMode }

export type MailMoveCopyMenuProps = {
  accountId: string
  currentFolder: string
  disabled?: boolean
  onSelectDestination: (mode: MailMoveCopyMenuMode, destination: string) => void
  onCreateFolder: (mode: MailMoveCopyMenuMode) => void
  triggerClassName?: string
}

export default function MailMoveCopyMenu({
  accountId,
  currentFolder,
  disabled = false,
  onSelectDestination,
  onCreateFolder,
  triggerClassName,
}: MailMoveCopyMenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const [open, setOpen] = useState(false)
  const options = useMailMoveCopyDestinations(accountId, currentFolder, !open)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={triggerClassName}
          aria-label={t('move.string')}
          data-testid="mail-action-btn-move-copy"
        >
          <FolderInput size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <MailMoveCopySubmenu
          mode="move"
          options={options}
          onSelectDestination={onSelectDestination}
          onCreateFolder={onCreateFolder}
          triggerTestId="mail-action-move-submenu"
        />
        <MailMoveCopySubmenu
          mode="copy"
          options={options}
          onSelectDestination={onSelectDestination}
          onCreateFolder={onCreateFolder}
          triggerTestId="mail-action-copy-submenu"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
