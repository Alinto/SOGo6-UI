'use client'

import { renameRecipients } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { ADDRESS_BOOKS_SLICE } from '@/lib/redux/api/api-slice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useMemo, useState } from 'react'
import type { VCard } from '../address-books-types'
import {
  useAddressBookEditState,
  useAddressBookState,
} from '../hooks/use-address-book-state'
import {
  addressBooksApiEndpoints,
  useAddVCardToAddressBookMutation,
  useUpdateVCardMutation,
} from '../store/address-books-api'
import { closeForm, selectRightsByBook } from '../store/address-books-ui-slice'
import { getContactDisplayName } from '../utils/contact-list'
import { listCreatableAddressBooks } from '../utils/list-creatable-address-books'
import { getContactApiErrorMessageKey } from '../utils/map-contact-api-error'
import {
  getContactEmails,
  getRecipientCardChanges,
} from '../utils/recipient-card-changes'
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
  const openContactAfterCreate = ui.openContactAfterCreate
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

      // Keep open compose windows (recipient names and contact cards) in
      // sync, only with what they show.
      const syncCompose = (
        id: string,
        { nameChanged, cardChanged }: ReturnType<typeof getRecipientCardChanges>
      ) => {
        const name = getContactDisplayName({ ...payload, id })
        if (nameChanged && name) {
          dispatch(
            renameRecipients({ emails: getContactEmails(payload), name })
          )
        }
        if (cardChanged) {
          dispatch(
            addressBooksApiEndpoints.util.invalidateTags([
              { type: ADDRESS_BOOKS_SLICE, id: 'ALL_CONTACTS' },
            ])
          )
        }
      }

      try {
        if (contactId) {
          await updateContact({
            book_id: bookId,
            id: contactId,
            kind: 'individual',
            ...payload,
            patchBody: serializedBody,
          }).unwrap()
          syncCompose(
            contactId,
            getRecipientCardChanges(editingContact, payload)
          )
          return
        }

        const created = await addContact({
          id: bookId,
          vCard: payload as VCard,
          createBody: serializedBody,
        }).unwrap()
        // e.g. a recipient added to the contacts from its compose card.
        syncCompose(created?.id ?? '', { nameChanged: true, cardChanged: true })

        if (created?.id && openContactAfterCreate) {
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
      dispatch,
      editingContact,
      openContactAfterCreate,
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
