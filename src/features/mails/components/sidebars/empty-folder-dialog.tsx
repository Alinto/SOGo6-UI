'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePurgeFolderMutation } from '../../store/mails-api'

export interface EmptyFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

export function EmptyFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
}: EmptyFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [purgeFolder, { isLoading }] = usePurgeFolderMutation()

  const handleConfirm = async () => {
    try {
      await purgeFolder({
        accountId,
        folderPath,
        permanentlyDelete: true,
        applyToSubfolders: false,
        date: new Date().toISOString().slice(0, 10),
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
            {t('folders.actions.empty_folder_dialog.title.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.empty_folder_dialog.description.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.empty_folder_dialog.cancel.string')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault()
              void handleConfirm()
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.empty_folder_dialog.confirm.string')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
