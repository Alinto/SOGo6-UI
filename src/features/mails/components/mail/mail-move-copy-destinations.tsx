'use client'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import type { ImapFolder } from '@/features/mails/mails-types'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import { Copy, FolderInput, FolderPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export type MailMoveCopyMenuMode = 'move' | 'copy'

export function flattenSelectableFolders(
  folders: ImapFolder[],
  excludePath: string,
  prefix = ''
): { path: string; label: string }[] {
  const result: { path: string; label: string }[] = []

  for (const folder of folders) {
    const label = prefix ? `${prefix} / ${folder.name}` : folder.name
    if (folder.selectable !== false && folder.path !== excludePath) {
      result.push({ path: folder.path, label })
    }

    const nested = folder.subfolders ?? folder.children ?? []
    if (nested.length > 0) {
      result.push(...flattenSelectableFolders(nested, excludePath, label))
    }
  }

  return result
}

export function useMailMoveCopyDestinations(
  accountId: string,
  currentFolder: string,
  skip: boolean
) {
  const { data: folders } = useGetFoldersQuery({ accountId }, { skip })

  return useMemo(
    () => flattenSelectableFolders(folders ?? [], currentFolder),
    [folders, currentFolder]
  )
}

export type MailMoveCopySubmenuProps = {
  mode: MailMoveCopyMenuMode
  options: { path: string; label: string }[]
  onSelectDestination: (mode: MailMoveCopyMenuMode, destination: string) => void
  onCreateFolder: (mode: MailMoveCopyMenuMode) => void
  triggerTestId?: string
}

export function MailMoveCopySubmenu({
  mode,
  options,
  onSelectDestination,
  onCreateFolder,
  triggerTestId,
}: MailMoveCopySubmenuProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger data-testid={triggerTestId}>
        {mode === 'move' ? (
          <FolderInput className="mr-2 h-4 w-4" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {mode === 'move' ? t('move.string') : t('copy.string')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="flex max-h-72 flex-col p-0">
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.path}
              onClick={() => onSelectDestination(mode, option.path)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="mx-0 my-0 shrink-0" />
        <div className="p-1">
          <DropdownMenuItem onClick={() => onCreateFolder(mode)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            {t('move_dialog.new_folder.string')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
