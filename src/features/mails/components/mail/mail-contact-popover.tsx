'use client'

import {
  openCreateForm,
  parseContactName,
  useGetAddressBooksQuery,
  useLazySearchContactsAutocompleteQuery,
} from '@/features/address_books'
import { resolveDefaultBookId } from '@/features/address_books/utils/resolve-default-book'
import { createDraft } from '@/features/mails/store'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useRouter } from '@/lib/i18n/navigation'
import { Mail as MailIcon, UserPlus2, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import type { EmailContact } from './types'

export function ContactPopoverContent({ contact }: { contact: EmailContact }) {
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { data: addressBooks } = useGetAddressBooksQuery()
  const [searchContacts, { data: suggestions }] =
    useLazySearchContactsAutocompleteQuery()

  const defaultBookId = useMemo(
    () =>
      resolveDefaultBookId(addressBooks?.personals ?? []) ?? undefined,
    [addressBooks?.personals]
  )

  useEffect(() => {
    if (!contact.email?.trim()) return
    void searchContacts({ q: contact.email.trim() })
  }, [contact.email, searchContacts])

  const matchedContact = useMemo(
    () =>
      suggestions?.find(
        (entry) =>
          entry.type === 'contact' &&
          entry.email?.toLowerCase() === contact.email.toLowerCase()
      ),
    [contact.email, suggestions]
  )

  const buttonClass =
    'flex cursor-pointer gap-2 rounded px-2 py-1 text-sm hover:bg-muted'

  const handleAddToAddressBook = () => {
    const { firstName, lastName } = parseContactName(contact.name)
    dispatch(
      openCreateForm({
        bookId: defaultBookId,
        prefill: {
          firstName,
          lastName,
          emails: contact.email ? [contact.email] : [],
        },
      })
    )
  }

  const handleWriteMessage = () => {
    const id = `compose-${Date.now()}`
    dispatch(
      createDraft({
        id,
        initialData: {
          to: [
            {
              email: contact.email,
              name: contact.name,
            },
          ],
        },
      })
    )
  }

  const handleViewContact = () => {
    const bookId = matchedContact?.addressBookKey ?? defaultBookId
    const contactId = matchedContact?.contactKey
    if (!bookId || !contactId) return
    push(`/address_books/${bookId}/${contactId}`)
  }

  return (
    <div className="flex flex-col gap-1">
      {matchedContact?.contactKey && (
        <button
          className={buttonClass}
          type="button"
          tabIndex={0}
          onClick={handleViewContact}
        >
          <UserRound size={16} className="text-muted-foreground" />
          {t(
            'mail_display.header.contacts-badge.popover-view-contact.string'
          )}
        </button>
      )}
      <button
        className={buttonClass}
        type="button"
        tabIndex={0}
        onClick={handleAddToAddressBook}
        disabled={!defaultBookId}
      >
        <UserPlus2 size={16} className="text-muted-foreground" />
        {t(
          'mail_display.header.contacts-badge.popover-add-to-addressbook.string'
        )}
      </button>
      <button
        className={buttonClass}
        type="button"
        tabIndex={0}
        onClick={handleWriteMessage}
      >
        <MailIcon size={16} className="text-muted-foreground" />
        {t(
          'mail_display.header.contacts-badge.popover-write-new-message.string'
        )}
      </button>
    </div>
  )
}
