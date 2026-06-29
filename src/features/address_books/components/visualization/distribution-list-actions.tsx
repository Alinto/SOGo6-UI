'use client'

import { createDraft } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import type { VCard } from '../../address-books-types'
import { useActiveAddressBookWritable } from '../../hooks/use-active-address-book'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import { openEditListForm } from '../../store/address-books-ui-slice'
import {
  getDistributionListEmails,
  getDistributionListName,
} from '../../utils/distribution-list'
import EntryActionsShell from './entry-actions-shell'

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
  const [exportOpen, setExportOpen] = useState(false)
  const { writable } = useActiveAddressBookWritable()
  const [deleteList, { isLoading: isDeleting }] =
    useDeleteVCardFromAddressBookMutation()

  const listName = getDistributionListName(list)
  const listEmails = getDistributionListEmails(list)

  const handleEdit = () => {
    dispatch(openEditListForm({ listId: list.id, bookId }))
  }

  const handleWriteMessage = () => {
    if (!listEmails.length) return

    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: listEmails.map((email) => {
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
    try {
      await deleteList({ id: bookId, vCardId: list.id, kind: 'group' }).unwrap()
      setDeleteOpen(false)
      push(`/address_books/${bookId}`)
    } catch {
      // RTK mutation handler shows toast; keep dialog open for retry
    }
  }

  return (
    <EntryActionsShell
      writeMessageLabel={t('write_message.string')}
      writeMessageDisabled={listEmails.length === 0}
      onWriteMessage={handleWriteMessage}
      writeMessageTestId="write-to-list-button"
      actionsMenuLabel={tContact('actions_menu.string')}
      actionsMenuTestId="list-actions-menu"
      exportLabel={tContact('export.string')}
      exportTestId="export-list-button"
      onExportOpen={() => setExportOpen(true)}
      writable={writable}
      editLabel={tContact('edit.string')}
      editTestId="edit-list-button"
      onEdit={handleEdit}
      deleteLabel={tContact('delete.string')}
      deleteTestId="delete-list-button"
      onDeleteOpen={() => setDeleteOpen(true)}
      exportOpen={exportOpen}
      onExportOpenChange={setExportOpen}
      bookId={bookId}
      entryId={list.id}
      entryLabel={listName}
      exportKind="group"
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      deleteDialogTitle={t('delete_dialog.title.string')}
      deleteDialogDescription={t('delete_dialog.description.string')}
      cancelLabel={tContact('cancel.string')}
      deleteConfirmLabel={t('delete_dialog.confirm.string')}
      onConfirmDelete={handleConfirmDelete}
      isDeleting={isDeleting}
    />
  )
}

export default memo(DistributionListActions)
