'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import {
  filterAndSortContacts,
  isIndividualContact,
  useGetAddressBooksQuery,
  useGetAddressBookVCardsQuery,
} from '@/features/address_books'
import { resolveDefaultBookId } from '@/features/address_books/utils/resolve-default-book'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { memo, useMemo } from 'react'

const SECTION_LIMIT = 8

function ContactRow({
  firstName,
  lastName,
  organization,
  href,
}: {
  firstName: string
  lastName: string
  organization?: string
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'hover:bg-sidebar-accent/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors'
      )}
      data-testid="fast-access-contact-row"
    >
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-xs">
          {firstName[0]?.toUpperCase()}
          {lastName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-foreground truncate font-medium">
          {[firstName, lastName].filter(Boolean).join(' ')}
        </p>
        {organization && (
          <p className="text-muted-foreground truncate text-xs">
            {organization}
          </p>
        )}
      </div>
    </Link>
  )
}

const AddressBookContent: React.FC = () => {
  const t = useTranslations('NAVIGATION.fast_access.address_book')

  const { data: addressBooks, isLoading: booksLoading, isError } =
    useGetAddressBooksQuery()

  const defaultBook = useMemo(() => {
    const personals = addressBooks?.personals ?? []
    const defaultId = resolveDefaultBookId(personals)
    if (!defaultId) return null
    return personals.find((book) => book.id === defaultId) ?? null
  }, [addressBooks?.personals])

  const { data: contacts = [], isLoading: contactsLoading } =
    useGetAddressBookVCardsQuery(defaultBook?.id ?? '', {
      skip: !defaultBook?.id,
    })

  const recentContacts = useMemo(
    () =>
      filterAndSortContacts(
        contacts.filter(isIndividualContact),
        '',
        'asc'
      ).slice(0, SECTION_LIMIT),
    [contacts]
  )

  const isLoading = booksLoading || contactsLoading
  const bookHref = defaultBook
    ? `/address_books/${defaultBook.id}`
    : '/address_books'

  return (
    <SidebarGroupContent
      className="flex flex-1 flex-col gap-3 overflow-hidden p-2"
      data-testid="address-book-panel"
    >
      <div className="flex shrink-0 items-center justify-between px-1">
        <span className="text-sm font-medium">{t('title')}</span>
        <Button variant="link" size="sm" className="h-auto p-0" asChild>
          <Link href={bookHref}>{t('view_all')}</Link>
        </Button>
      </div>

      <div className="scrollbar-thin-gray flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {isLoading && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('loading')}</p>
        )}

        {!isLoading && isError && (
          <p className="text-destructive px-2 py-3 text-xs">{t('error')}</p>
        )}

        {!isLoading && !isError && !defaultBook && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('empty')}</p>
        )}

        {!isLoading && !isError && defaultBook && recentContacts.length === 0 && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('no_contacts')}</p>
        )}

        {!isLoading &&
          !isError &&
          recentContacts.map((contact) => (
            <ContactRow
              key={contact.id}
              firstName={contact.firstName}
              lastName={contact.lastName}
              organization={contact.organization}
              href={`/address_books/${defaultBook?.id}/${contact.id}`}
            />
          ))}
      </div>
    </SidebarGroupContent>
  )
}

export default memo(AddressBookContent)
