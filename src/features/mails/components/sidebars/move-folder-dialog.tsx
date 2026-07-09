'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetFoldersQuery, useMoveFolderMutation } from '../../store/mails-api'
import type { ImapFolder } from '../../mails-types'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export interface MoveFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
  folderDelimiter: string
}

function flattenFolderPaths(
  folders: ImapFolder[],
  excludePath: string,
  prefix = ''
): { path: string; label: string }[] {
  const result: { path: string; label: string }[] = []

  for (const folder of folders) {
    if (folder.path === excludePath) continue
    if (folder.path.startsWith(`${excludePath}/`)) continue

    const label = prefix ? `${prefix} / ${folder.name}` : folder.name
    if (folder.selectable !== false) {
      result.push({ path: folder.path, label })
    }

    const nested = folder.subfolders ?? folder.children ?? []
    if (nested.length > 0) {
      result.push(...flattenFolderPaths(nested, excludePath, label))
    }
  }

  return result
}

export function MoveFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
  folderDelimiter,
}: MoveFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { data: folders = [] } = useGetFoldersQuery({ accountId })
  const [moveFolder, { isLoading }] = useMoveFolderMutation()
  const [parentPath, setParentPath] = useState('')

  const parentOptions = useMemo(
    () => [
      { path: '', label: t('folders.actions.move_to_dialog.root.string') },
      ...flattenFolderPaths(folders, folderPath),
    ],
    [folders, folderPath, t]
  )

  const handleSubmit = async () => {
    const newPath = parentPath
      ? `${parentPath}${folderDelimiter}${folderName}`
      : folderName

    try {
      await moveFolder({
        accountId,
        folderPath,
        newPath,
      }).unwrap()
      onOpenChange(false)
    } catch {
      // handled by notification handler
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('folders.actions.move_to_dialog.title.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.move_to_dialog.description.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select value={parentPath} onValueChange={setParentPath}>
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                'folders.actions.move_to_dialog.placeholder.string'
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {parentOptions.map((option) => (
              <SelectItem key={option.path || '__root__'} value={option.path}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.move_to_dialog.cancel.string')}
          </AlertDialogCancel>
          <Button disabled={isLoading} onClick={() => void handleSubmit()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.move_to_dialog.confirm.string')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
