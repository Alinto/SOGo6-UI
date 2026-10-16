'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Mail, Pencil, Phone, UserPlus2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'
import { findAddressBook } from '../hooks/use-active-address-book'
import {
  useGetAddressBooksQuery,
  useSearchAllContactsQuery,
} from '../store/address-books-api'
import {
  openCreateForm,
  openEditForm,
  selectBookRights,
} from '../store/address-books-ui-slice'
import { getAddressBookPermissions } from '../utils/address-book-permissions'
import { getContactDisplayName, parseContactName } from '../utils/contact-list'
import { getContactPhotoSrc } from '../utils/contact-photo'
import {
  getContactEmails,
  getContactPhones,
} from '../utils/recipient-card-changes'
import { resolveDefaultBookId } from '../utils/resolve-default-book'
import RecipientAvatar from './recipient-avatar'

const ACTION_BUTTON_CLASS =
  'text-muted-foreground hover:bg-muted-foreground/15 hover:text-foreground -mt-1 -mr-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full'

type RecipientContactCardProps = {
  email: string
  // Display name known from the autocomplete or the draft.
  name?: string
}

// Mounted only while the card is open, so the contact is looked up lazily
// (and cached by RTK Query) from the recipient's email.
const RecipientContactCard: React.FC<RecipientContactCardProps> = ({
  email,
  name,
}) => {
  const t = useTranslations('CONTACT_FORM')
  const tMails = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { data, isLoading } = useSearchAllContactsQuery({
    params: { search: email, page: 1, page_size: 5 },
  })
  const { data: addressBooks } = useGetAddressBooksQuery()

  const contact = useMemo(() => {
    const target = email.toLowerCase()
    return data?.items.find(
      (item) =>
        item.kind !== 'group' &&
        getContactEmails(item).some((value) => value.toLowerCase() === target)
    )
  }, [data, email])

  const bookId = contact?.addressBookKey ?? null
  const rights = useAppSelector((state) => selectBookRights(state, bookId))
  const canEdit =
    !!contact &&
    !!bookId &&
    getAddressBookPermissions(findAddressBook(addressBooks, bookId), rights)
      .canEdit

  // An address that matches no contact can be added to the default book.
  const createBookId =
    !isLoading && !contact
      ? resolveDefaultBookId(addressBooks?.personals ?? [])
      : null

  const displayName = (contact && getContactDisplayName(contact)) || name || ''
  const photo = contact ? getContactPhotoSrc(contact) : undefined
  const phones = contact ? getContactPhones(contact) : []

  return (
    <div className="flex min-w-0 items-start gap-3">
      <RecipientAvatar
        email={email}
        name={displayName || undefined}
        photo={photo}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        {displayName && (
          <p className="text-foreground truncate font-semibold">
            {displayName}
          </p>
        )}
        <p className="text-muted-foreground flex min-w-0 items-center gap-2">
          <Mail
            className="h-3.5 w-3.5 shrink-0"
            role="img"
            aria-label={t('emails.string')}
          />
          <span className="truncate select-all">{email}</span>
        </p>
        {isLoading && <Skeleton className="h-4 w-28" />}
        {phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone}`}
            className="text-muted-foreground hover:text-foreground flex min-w-0 items-center gap-2"
          >
            <Phone
              className="h-3.5 w-3.5 shrink-0"
              role="img"
              aria-label={t('phone_numbers.string')}
            />
            <span className="truncate">{phone}</span>
          </a>
        ))}
      </div>
      {canEdit && contact && bookId && (
        <button
          type="button"
          aria-label={t('edit.string')}
          title={t('edit.string')}
          className={ACTION_BUTTON_CLASS}
          onClick={() =>
            dispatch(openEditForm({ contactId: contact.id, bookId }))
          }
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {createBookId && (
        <button
          type="button"
          aria-label={tMails(
            'mail_display.header.contacts-badge.popover-add-to-addressbook.string'
          )}
          title={tMails(
            'mail_display.header.contacts-badge.popover-add-to-addressbook.string'
          )}
          className={ACTION_BUTTON_CLASS}
          onClick={() =>
            dispatch(
              openCreateForm({
                bookId: createBookId,
                prefill: { ...parseContactName(name), emails: [email] },
                // Stay in the compose window.
                openContactAfterCreate: false,
              })
            )
          }
        >
          <UserPlus2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default memo(RecipientContactCard)
