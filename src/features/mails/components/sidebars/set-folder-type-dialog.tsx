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
import type { ImapFolderType } from '../../mails-types'
import { useSetFolderTypeMutation } from '../../store/mails-api'
import { SET_AS_FOLDER_TYPES } from '../../utils/folder-actions'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface SetFolderTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

export function SetFolderTypeDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
}: SetFolderTypeDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [setFolderType, { isLoading }] = useSetFolderTypeMutation()

  const handleSelect = async (type: ImapFolderType) => {
    try {
      await setFolderType({
        accountId,
        folderPath,
        type,
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
            {t('folders.actions.set_as_dialog.title.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.set_as_dialog.description.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          {SET_AS_FOLDER_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => void handleSelect(type)}
            >
              {t(`folders.actions.set_as_dialog.types.${type}.string`)}
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.set_as_dialog.cancel.string')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
