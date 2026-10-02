'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useMemo, useState } from 'react'
import type { VCard } from '../address-books-types'
import {
  useAddressBookEditState,
  useAddressBookState,
} from '../hooks/use-address-book-state'
import {
  useAddVCardToAddressBookMutation,
  useUpdateVCardMutation,
} from '../store/address-books-api'
import { closeForm, selectRightsByBook } from '../store/address-books-ui-slice'
import { listCreatableAddressBooks } from '../utils/list-creatable-address-books'
import { getContactApiErrorMessageKey } from '../utils/map-contact-api-error'
import { serializeContactFromForm } from '../utils/serialize-contact'
import ContactForm, {
  fromFieldArray,
  type ContactFormValues,
} from './contact-form'

function ContactFormHost() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const { activeBookId, ui, addressBooks } = useAddressBookState()
  const rightsByBook = useAppSelector(selectRightsByBook)
  const creatableBooks = useMemo(
    () => listCreatableAddressBooks(addressBooks, rightsByBook),
    [addressBooks, rightsByBook]
  )
  const defaultBookId = creatableBooks.some((book) => book.id === activeBookId)
    ? activeBookId
    : (creatableBooks[0]?.id ?? null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [addContact, { isLoading: isCreating }] =
    useAddVCardToAddressBookMutation()
  const [updateContact, { isLoading: isUpdating }] = useUpdateVCardMutation()

  const editingContactId = ui.editingContactId
  const {
    editingEntity: editingContact,
    isEditLoading,
    isEditLoadError,
  } = useAddressBookEditState(editingContactId, activeBookId, ui.isFormOpen)

  const handleClose = useCallback(() => {
    setSubmitError(null)
    dispatch(closeForm())
  }, [dispatch])

  const buildVCardPayload = useCallback(
    (values: ContactFormValues): Omit<VCard, 'id'> => ({
      version: '4.0',
      kind: 'individual',
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      organization: values.organization?.trim() || undefined,
      jobTitle: values.jobTitle?.trim() || undefined,
      emails: fromFieldArray(values.emails),
      phoneNumbers: fromFieldArray(values.phoneNumbers),
      urls: fromFieldArray(values.urls),
      categories: values.categories.length ? values.categories : undefined,
      birthday: values.birthday?.trim() || undefined,
      photos: values.clearPhoto
        ? []
        : values.photoDataUri
          ? [values.photoDataUri]
          : undefined,
      note: values.note?.trim() || undefined,
    }),
    []
  )

  const handleSubmit = useCallback(
    async (values: ContactFormValues, contactId?: string) => {
      const bookId = contactId
        ? activeBookId
        : values.bookId || defaultBookId || activeBookId
      if (!bookId) return

      setSubmitError(null)
      const payload = buildVCardPayload(values)
      const serializedBody = serializeContactFromForm(values)

      try {
        if (contactId) {
          await updateContact({
            book_id: bookId,
            id: contactId,
            kind: 'individual',
            ...payload,
            patchBody: serializedBody,
          }).unwrap()
          return
        }

        const created = await addContact({
          id: bookId,
          vCard: payload as VCard,
          createBody: serializedBody,
        }).unwrap()

        if (created?.id) {
          push(`/address_books/${bookId}/${created.id}`)
        }
      } catch (error) {
        setSubmitError(
          tErrors(getContactApiErrorMessageKey(error, 'contact_form'))
        )
      }
    },
    [
      activeBookId,
      addContact,
      buildVCardPayload,
      defaultBookId,
      push,
      tErrors,
      updateContact,
    ]
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
      addressBooks={creatableBooks}
      defaultBookId={defaultBookId}
      submitError={submitError}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export default memo(ContactFormHost)
