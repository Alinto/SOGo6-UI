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
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useDeleteFolderMutation } from '../../store/mails-api'

export interface DeleteFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

export function DeleteFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
}: DeleteFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { account, folder } = useParams()
  const [deleteFolder, { isLoading }] = useDeleteFolderMutation()

  const handleConfirm = async () => {
    const currentFolder = Array.isArray(folder)
      ? folder.join('/')
      : typeof folder === 'string'
        ? folder
        : ''
    const isViewingDeletedOrDescendant =
      !!currentFolder &&
      (currentFolder === folderPath ||
        currentFolder.startsWith(`${folderPath}/`) ||
        currentFolder.startsWith(`${folderPath}.`))

    try {
      if (isViewingDeletedOrDescendant) {
        dispatch(setSkipFolderFetch(true))
      }

      await deleteFolder({ accountId, folderPath }).unwrap()

      if (isViewingDeletedOrDescendant) {
        const acc = String(account ?? accountId)
        push(`/u/${acc}/INBOX`)
      }

      onOpenChange(false)
    } catch {
      dispatch(setSkipFolderFetch(false))
      // Error already handled by createApiNotificationHandler
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('folders.actions.delete.confirmTitle.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.delete.confirmDesc.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('folders.actions.delete.cancel.string')}
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
              t('folders.actions.delete.confirm.string')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
