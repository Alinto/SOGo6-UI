'use client'

import { createDraft } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { useActiveAddressBookWritable } from '../../hooks/use-active-address-book'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import { openEditForm } from '../../store/address-books-ui-slice'
import EntryActionsShell from './entry-actions-shell'

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
  const [exportOpen, setExportOpen] = useState(false)
  const { writable } = useActiveAddressBookWritable()
  const [deleteContact, { isLoading: isDeleting }] =
    useDeleteVCardFromAddressBookMutation()

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
    try {
      await deleteContact({ id: bookId, vCardId: contactId }).unwrap()
      setDeleteOpen(false)
      push(`/address_books/${bookId}`)
    } catch {
      // RTK mutation handler shows toast; keep dialog open for retry
    }
  }

  return (
    <EntryActionsShell
      writeMessageLabel={t('write_message.string')}
      writeMessageDisabled={validEmails.length === 0}
      onWriteMessage={handleWriteMessage}
      writeMessageTestId="write-to-contact-button"
      actionsMenuLabel={t('actions_menu.string')}
      actionsMenuTestId="contact-actions-menu"
      exportLabel={t('export.string')}
      exportTestId="export-contact-button"
      onExportOpen={() => setExportOpen(true)}
      writable={writable}
      editLabel={t('edit.string')}
      editTestId="edit-contact-button"
      onEdit={handleEdit}
      deleteLabel={t('delete.string')}
      deleteTestId="delete-contact-button"
      onDeleteOpen={() => setDeleteOpen(true)}
      exportOpen={exportOpen}
      onExportOpenChange={setExportOpen}
      bookId={bookId}
      entryId={contactId}
      entryLabel={displayName || contactId}
      exportKind="individual"
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      deleteDialogTitle={t('delete_dialog.title.string')}
      deleteDialogDescription={t('delete_dialog.description.string')}
      cancelLabel={t('cancel.string')}
      deleteConfirmLabel={t('delete_dialog.confirm.string')}
      onConfirmDelete={handleConfirmDelete}
      isDeleting={isDeleting}
    />
  )
}

export default memo(ContactActions)
