'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { memo, useCallback } from 'react'
import type { VCard } from '../address-books-types'
import {
  useAddressBookEditState,
  useAddressBookState,
} from '../hooks/use-address-book-state'
import {
  useAddVCardToAddressBookMutation,
  useUpdateVCardMutation,
} from '../store/address-books-api'
import { closeForm } from '../store/address-books-ui-slice'
import ContactForm, {
  fromFieldArray,
  type ContactFormValues,
} from './contact-form'

function ContactFormHost() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { activeBookId, ui } = useAddressBookState()

  const [addContact, { isLoading: isCreating }] =
    useAddVCardToAddressBookMutation()
  const [updateContact, { isLoading: isUpdating }] = useUpdateVCardMutation()

  const editingContactId = ui.editingContactId
  const { editingEntity: editingContact, isEditLoading, isEditLoadError } =
    useAddressBookEditState(editingContactId, activeBookId, ui.isFormOpen)

  const handleClose = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  const buildVCardPayload = useCallback(
    (values: ContactFormValues): Omit<VCard, 'id'> => ({
      version: '4.0',
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      organization: values.organization?.trim() || undefined,
      jobTitle: values.jobTitle?.trim() || undefined,
      emails: fromFieldArray(values.emails),
      phoneNumbers: fromFieldArray(values.phoneNumbers),
      note: values.note?.trim() || undefined,
    }),
    []
  )

  const handleSubmit = useCallback(
    async (values: ContactFormValues, contactId?: string) => {
      if (!activeBookId) return

      const payload = buildVCardPayload(values)

      if (contactId) {
        await updateContact({
          book_id: activeBookId,
          id: contactId,
          ...payload,
        }).unwrap()
        return
      }

      const created = await addContact({
        id: activeBookId,
        vCard: payload as VCard,
      }).unwrap()

      if (created?.id) {
        push(`/address_books/${activeBookId}/${created.id}`)
      }
    },
    [activeBookId, addContact, buildVCardPayload, push, updateContact]
  )

  if (!activeBookId && ui.isFormOpen) {
    return null
  }

  return (
    <ContactForm
      open={ui.isFormOpen}
      isEditMode={Boolean(editingContactId)}
      isLoading={isEditLoading}
      loadError={isEditLoadError}
      isSubmitting={isCreating || isUpdating}
      contact={editingContactId ? (editingContact ?? null) : null}
      prefill={ui.prefillContact}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(ContactFormHost)
