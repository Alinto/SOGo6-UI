'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ImapFolder } from '@/features/mails/mails-types'
import {
  useCreateFolderMutation,
  useGetFoldersQuery,
} from '@/features/mails/store/mails-api'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export type MailMoveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  currentFolder: string
  isLoading?: boolean
  mode?: 'move' | 'copy'
  onConfirm: (destination: string) => Promise<void>
}

function flattenSelectableFolders(
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

export default function MailMoveDialog({
  open,
  onOpenChange,
  accountId,
  currentFolder,
  isLoading = false,
  mode = 'move',
  onConfirm,
}: MailMoveDialogProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const dialogTitleKey = mode === 'copy' ? 'copy.string' : 'move.string'
  const createLabelKey =
    mode === 'copy'
      ? 'copy_dialog.create_and_copy.string'
      : 'move_dialog.create_and_move.string'
  const { data: folders, isFetching } = useGetFoldersQuery(
    { accountId },
    { skip: !open }
  )
  const [createFolder, { isLoading: isCreatingFolder }] =
    useCreateFolderMutation()
  const [parent, setParent] = useState('')
  const [newFolderName, setNewFolderName] = useState('')

  const options = useMemo(
    () => flattenSelectableFolders(folders ?? [], currentFolder),
    [folders, currentFolder]
  )

  const busy = isLoading || isFetching || isCreatingFolder

  const resetState = () => {
    setParent('')
    setNewFolderName('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  const handleCreateAndConfirm = async () => {
    const name = newFolderName.trim()
    if (!name) return
    try {
      const newFolder = await createFolder({
        accountId,
        body: { name, parent },
      }).unwrap()
      resetState()
      await onConfirm(newFolder.path)
    } catch {
      // handled by createApiNotificationHandler on the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder={t('move_dialog.new_folder_placeholder.string')}
            disabled={busy}
          />
          <Select value={parent} onValueChange={setParent}>
            <SelectTrigger>
              <SelectValue
                placeholder={t('move_dialog.parent_placeholder.string')}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.path} value={option.path}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            {t('move_dialog.cancel.string')}
          </Button>
          <Button
            disabled={busy || !newFolderName.trim()}
            onClick={() => void handleCreateAndConfirm()}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t(createLabelKey)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
