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
import { Button } from '@/components/ui/button'
import { createDraft } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Mail, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import type { VCard } from '../../address-books-types'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import { openEditListForm } from '../../store/address-books-ui-slice'
import { getDistributionListEmails } from '../../utils/distribution-list'

type DistributionListActionsProps = {
  list: VCard
  bookId: string
}

function DistributionListActions({ list, bookId }: DistributionListActionsProps) {
  const t = useTranslations('DISTRIBUTION_LIST_FORM')
  const tContact = useTranslations('CONTACT_FORM')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteList] = useDeleteVCardFromAddressBookMutation()

  const handleEdit = () => {
    dispatch(openEditListForm({ listId: list.id, bookId }))
  }

  const handleWriteMessage = () => {
    const emails = getDistributionListEmails(list)
    if (!emails.length) return

    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: emails.map((email) => {
            const member = list.members?.find((item) => item.email === email)
            return {
              email,
              name: member?.displayName,
            }
          }),
        },
      })
    )
  }

  const handleConfirmDelete = async () => {
    await deleteList({ id: bookId, vCardId: list.id }).unwrap()
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
          disabled={getDistributionListEmails(list).length === 0}
          data-testid="write-to-list-button"
        >
          <Mail className="mr-1 h-4 w-4" />
          {t('write_message.string')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          data-testid="edit-list-button"
        >
          <Pencil className="mr-1 h-4 w-4" />
          {tContact('edit.string')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          data-testid="delete-list-button"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          {tContact('delete.string')}
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
            <AlertDialogCancel>{tContact('cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(DistributionListActions)
