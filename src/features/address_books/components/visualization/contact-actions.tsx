'use client'

import { Button } from '@/components/ui/button'
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
import { createDraft } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Mail, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import { openEditForm } from '../../store/address-books-ui-slice'

type ContactActionsProps = {
  contactId: string
  bookId: string
  emails?: string[]
  displayName?: string
}

function ContactActions({
  contactId,
  bookId,
  emails = [],
  displayName,
}: ContactActionsProps) {
  const t = useTranslations('CONTACT_FORM')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteContact] = useDeleteVCardFromAddressBookMutation()

  const validEmails = emails.filter(Boolean)

  const handleEdit = () => {
    dispatch(openEditForm({ contactId, bookId }))
  }

  const handleWriteMessage = () => {
    if (!validEmails.length) return

    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: validEmails.map((email) => ({
            email,
            name: displayName,
          })),
        },
      })
    )
  }

  const handleConfirmDelete = async () => {
    await deleteContact({ id: bookId, vCardId: contactId }).unwrap()
    setDeleteOpen(false)
    push(`/address_books/${bookId}`)
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleWriteMessage}
          disabled={validEmails.length === 0}
          data-testid="write-to-contact-button"
        >
          <Mail className="mr-1 h-4 w-4" />
          {t('write_message.string')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          data-testid="edit-contact-button"
        >
          <Pencil className="mr-1 h-4 w-4" />
          {t('edit.string')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          data-testid="delete-contact-button"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          {t('delete.string')}
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_dialog.title.string')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_dialog.description.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(ContactActions)
