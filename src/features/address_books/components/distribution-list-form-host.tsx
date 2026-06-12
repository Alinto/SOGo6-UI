'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { memo, useCallback } from 'react'
import type { ContactMember, VCard } from '../address-books-types'
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
import { getContactDisplayName } from '../utils/contact-list'
import DistributionListForm, {
  type DistributionListFormValues,
} from './distribution-list-form'

function buildMembersFromForm(
  values: DistributionListFormValues,
  bookContacts: VCard[]
): ContactMember[] {
  const members: ContactMember[] = []
  const seen = new Set<string>()

  for (const contactId of values.memberContactIds) {
    const contact = bookContacts.find((item) => item.id === contactId)
    if (!contact) continue
    const email = contact.emails?.[0]?.trim() ?? ''
    const key = email ? email.toLowerCase() : `contact:${contactId}`
    if (seen.has(key)) continue
    seen.add(key)
    members.push({
      contactId,
      email,
      displayName: getContactDisplayName(contact),
    })
  }

  for (const entry of values.manualEmails) {
    const email = entry.value.trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    members.push({ email })
  }

  return members
}

function DistributionListFormHost() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { activeBookId, ui } = useAddressBookState()

  const [addEntry, { isLoading: isCreating }] = useAddVCardToAddressBookMutation()
  const [updateEntry, { isLoading: isUpdating }] = useUpdateVCardMutation()

  const { data: bookContacts = [] } = useGetAddressBookVCardsQuery(
    activeBookId ?? skipToken
  )

  const editingListId = ui.editingListId
  const { editingEntity: editingList, isEditLoading, isEditLoadError } =
    useAddressBookEditState(editingListId, activeBookId, ui.isListFormOpen)

  const handleClose = useCallback(() => {
    dispatch(closeListForm())
  }, [dispatch])

  const handleSubmit = useCallback(
    async (values: DistributionListFormValues, listId?: string) => {
      if (!activeBookId) return

      const members = buildMembersFromForm(values, bookContacts)
      const payload: Omit<VCard, 'id'> = {
        version: '4.0',
        kind: 'group',
        firstName: values.name.trim(),
        lastName: '',
        note: values.note?.trim() || undefined,
        members,
        categories: [],
        urls: [],
        photos: [],
        emails: [],
        phoneNumbers: [],
        addresses: [],
        impp: [],
      }

      if (listId) {
        await updateEntry({
          book_id: activeBookId,
          id: listId,
          ...payload,
        }).unwrap()
        return
      }

      const created = await addEntry({
        id: activeBookId,
        vCard: payload as VCard,
      }).unwrap()

      if (created?.id) {
        push(`/address_books/${activeBookId}/${created.id}`)
      }
    },
    [activeBookId, addEntry, bookContacts, push, updateEntry]
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
