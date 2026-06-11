'use client'

import {
  openCreateForm,
  parseContactName,
  useGetAddressBooksQuery,
} from '@/features/address_books'
import { resolveDefaultBookId } from '@/features/address_books/utils/resolve-default-book'
import { createDraft } from '@/features/mails/store'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Mail as MailIcon, UserPlus2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import type { EmailContact } from './types'

export function ContactPopoverContent({ contact }: { contact: EmailContact }) {
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { data: addressBooks } = useGetAddressBooksQuery()
  const defaultBookId = useMemo(
    () =>
      resolveDefaultBookId(addressBooks?.personals ?? []) ?? undefined,
    [addressBooks?.personals]
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

  return (
    <div className="flex flex-col gap-1">
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
