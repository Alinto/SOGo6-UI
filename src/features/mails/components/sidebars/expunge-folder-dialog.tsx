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
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useExpungeFolderMutation } from '../../store/mails-api'

interface ExpungeFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

export function ExpungeFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
}: ExpungeFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [expungeFolder, { isLoading }] = useExpungeFolderMutation()

  const handleConfirm = async () => {
    try {
      await expungeFolder({ accountId, folderPath }).unwrap()
      onOpenChange(false)
    } catch {
      // Error already handled by createApiNotificationHandler
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('folders.actions.expunge.confirmTitle.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.expunge.confirmDesc.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.expunge.cancel.string')}
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={() => handleConfirm()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.expunge.confirm.string')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
