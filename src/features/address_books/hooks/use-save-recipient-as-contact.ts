'use client'

import { useCallback, useMemo } from 'react'
import {
  useAddVCardToAddressBookMutation,
  useGetAddressBooksQuery,
} from '../store/address-books-api'
import { resolveDefaultBookId } from '../utils/resolve-default-book'

/**
 * Saves a typed recipient address as a contact in the user's default
 * personal address book. Success/error toasts are emitted by the mutation.
 */
export function useSaveRecipientAsContact() {
  const { data: addressBooks } = useGetAddressBooksQuery()
  const [addContact] = useAddVCardToAddressBookMutation()

  const defaultBookId = useMemo(
    () => resolveDefaultBookId(addressBooks?.personals ?? []),
    [addressBooks?.personals]
  )

  const saveAsContact = useCallback(
    async (email: string) => {
      const trimmed = email.trim()
      if (!defaultBookId || !trimmed) return
      try {
        await addContact({
          id: defaultBookId,
          vCard: {
            version: '4.0',
            kind: 'individual',
            firstName: trimmed.split('@')[0],
            lastName: '',
            emails: [trimmed],
          },
        }).unwrap()
      } catch {
        // notification handler surfaces the error
      }
    },
    [addContact, defaultBookId]
  )

  return { saveAsContact, canSaveAsContact: Boolean(defaultBookId) }
}
