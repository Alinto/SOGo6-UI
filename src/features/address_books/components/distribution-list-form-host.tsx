'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { memo, useCallback } from 'react'
import {
  useAddressBookEditState,
  useAddressBookState,
} from '../hooks/use-address-book-state'
import {
  useAddVCardToAddressBookMutation,
  useGetAddressBookVCardsQuery,
  useUpdateVCardMutation,
} from '../store/address-books-api'
import { closeListForm } from '../store/address-books-ui-slice'
import { selectBookEntriesItems } from '../hooks/use-address-book-entries'
import DistributionListForm, {
  type DistributionListFormValues,
} from './distribution-list-form'

function DistributionListFormHost() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { activeBookId, ui } = useAddressBookState()

  const [addEntry, { isLoading: isCreating }] = useAddVCardToAddressBookMutation()
  const [updateEntry, { isLoading: isUpdating }] = useUpdateVCardMutation()

  const { data: bookEntries } = useGetAddressBookVCardsQuery(
    activeBookId
      ? { bookId: activeBookId, params: { page_size: 200 } }
      : skipToken
  )
  const bookContacts = selectBookEntriesItems(bookEntries).filter(
    (entry) => entry.kind !== 'group'
  )

  const editingListId = ui.editingListId
  const { editingEntity: editingList, isEditLoading, isEditLoadError } =
    useAddressBookEditState(editingListId, activeBookId, ui.isListFormOpen, 'group')

  const handleClose = useCallback(() => {
    dispatch(closeListForm())
  }, [dispatch])

  const handleSubmit = useCallback(
    async (values: DistributionListFormValues, listId?: string) => {
      if (!activeBookId) return

      if (listId) {
        await updateEntry({
          book_id: activeBookId,
          id: listId,
          kind: 'group',
          firstName: values.name.trim(),
          note: values.note?.trim() || undefined,
          members: values.memberContactIds.map((contactId) => ({
            contactId,
            email: '',
          })),
        }).unwrap()
        return
      }

      const created = await addEntry({
        id: activeBookId,
        vCard: {
          version: '4.0',
          kind: 'group',
          firstName: values.name.trim(),
          lastName: '',
          note: values.note?.trim() || undefined,
          members: values.memberContactIds.map((contactId) => ({
            contactId,
            email: '',
          })),
        },
      }).unwrap()

      if (created?.id) {
        push(`/address_books/${activeBookId}/${created.id}`)
      }
    },
    [activeBookId, addEntry, push, updateEntry]
  )

  if (!activeBookId && ui.isListFormOpen) {
    return null
  }

  return (
    <DistributionListForm
      open={ui.isListFormOpen}
      isEditMode={Boolean(editingListId)}
      isLoading={isEditLoading}
      loadError={isEditLoadError}
      isSubmitting={isCreating || isUpdating}
      list={editingListId ? (editingList ?? null) : null}
      prefillMembers={ui.prefillListMembers}
      bookContacts={bookContacts}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(DistributionListFormHost)
