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
import { useMarkFolderAsReadMutation } from '../../store/mails-api'

export interface MarkFolderReadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

export function MarkFolderReadDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
}: MarkFolderReadDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [markFolderAsRead, { isLoading }] = useMarkFolderAsReadMutation()

  const handleConfirm = async () => {
    try {
      await markFolderAsRead({ accountId, folderPath }).unwrap()
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
            {t('folders.actions.mark_as_read_dialog.title.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.mark_as_read_dialog.description.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.mark_as_read_dialog.cancel.string')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault()
              void handleConfirm()
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.mark_as_read_dialog.confirm.string')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
