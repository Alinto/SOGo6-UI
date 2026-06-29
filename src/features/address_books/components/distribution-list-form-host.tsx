'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'
import { useAddressBookContactPicker } from '../hooks/use-address-book-contact-picker'
import {
  useAddVCardToAddressBookMutation,
  useUpdateVCardMutation,
} from '../store/address-books-api'
import { closeListForm } from '../store/address-books-ui-slice'
import {
  useAddressBookEditState,
  useAddressBookState,
} from '../hooks/use-address-book-state'
import { getContactApiErrorMessageKey } from '../utils/map-contact-api-error'
import DistributionListForm, {
  type DistributionListFormValues,
} from './distribution-list-form'

function DistributionListFormHost() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const { activeBookId, ui } = useAddressBookState()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [addEntry, { isLoading: isCreating }] = useAddVCardToAddressBookMutation()
  const [updateEntry, { isLoading: isUpdating }] = useUpdateVCardMutation()

  const { contacts: bookContacts, isLoading: isPickerLoading } =
    useAddressBookContactPicker(activeBookId, {
      enabled: ui.isListFormOpen && Boolean(activeBookId),
    })

  const editingListId = ui.editingListId
  const { editingEntity: editingList, isEditLoading, isEditLoadError } =
    useAddressBookEditState(editingListId, activeBookId, ui.isListFormOpen, 'group')

  const handleClose = useCallback(() => {
    setSubmitError(null)
    dispatch(closeListForm())
  }, [dispatch])

  const handleSubmit = useCallback(
    async (values: DistributionListFormValues, listId?: string) => {
      if (!activeBookId) return

      setSubmitError(null)

      try {
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
          dispatch(closeListForm())
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

        dispatch(closeListForm())

        if (created?.id) {
          push(`/address_books/${activeBookId}/${created.id}`)
        }
      } catch (error) {
        setSubmitError(
          tErrors(getContactApiErrorMessageKey(error, 'list_form'))
        )
      }
    },
    [activeBookId, addEntry, dispatch, push, tErrors, updateEntry]
  )

  if (!activeBookId && ui.isListFormOpen) {
    return null
  }

  return (
    <DistributionListForm
      open={ui.isListFormOpen}
      isEditMode={Boolean(editingListId)}
      isLoading={isEditLoading || isPickerLoading}
      loadError={isEditLoadError}
      isSubmitting={isCreating || isUpdating}
      list={editingListId ? (editingList ?? null) : null}
      prefillMembers={ui.prefillListMembers}
      bookContacts={bookContacts}
      submitError={submitError}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(DistributionListFormHost)
