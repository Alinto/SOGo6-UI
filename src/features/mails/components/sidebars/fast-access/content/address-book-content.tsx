'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import {
  getContactDisplayName,
  getDistributionListEmails,
  getDistributionListMemberCount,
  partitionAddressBookEntries,
  useGetAddressBooksQuery,
  useGetAddressBookVCardsQuery,
} from '@/features/address_books'
import { resolveDefaultBookId } from '@/features/address_books/utils/resolve-default-book'
import type { VCard } from '@/features/address_books/address-books-types'
import { createDraft } from '@/features/mails/store'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { Mail, Search, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { memo, useCallback, useMemo, useState } from 'react'

const LIST_SECTION_LIMIT = 4
const CONTACT_SECTION_LIMIT = 6

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-1 flex items-center justify-between px-2">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {title}
      </p>
      {count > 0 && (
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      )}
    </div>
  )
}

function EntryRow({
  href,
  title,
  subtitle,
  leading,
  composeLabel,
  onCompose,
  testId,
}: {
  href: string
  title: string
  subtitle?: string
  leading: React.ReactNode
  composeLabel: string
  onCompose?: () => void
  testId: string
}) {
  return (
    <div
      className="group flex items-center gap-0.5 rounded-md transition-colors hover:bg-sidebar-accent/50"
      data-testid={testId}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm"
      >
        {leading}
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{title}</p>
          {subtitle && (
            <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
          )}
        </div>
      </Link>
      {onCompose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground mr-0.5 h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          aria-label={composeLabel}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onCompose()
          }}
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

function ContactLeading({ contact }: { contact: VCard }) {
  const initials = `${contact.firstName[0] ?? ''}${contact.lastName[0] ?? ''}`.toUpperCase()

  return (
    <Avatar className="h-7 w-7 shrink-0">
      <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
    </Avatar>
  )
}

function DistributionListLeading() {
  return (
    <span className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
      <Users className="h-3.5 w-3.5" aria-hidden />
    </span>
  )
}

function getContactSubtitle(contact: VCard): string | undefined {
  return (
    contact.organization?.trim() ||
    contact.emails?.[0]?.trim() ||
    contact.phoneNumbers?.[0]?.trim() ||
    undefined
  )
}

function AddressBookSection({
  sectionId,
  title,
  items,
  totalCount,
  bookId,
  composeLabel,
  onComposeContact,
  onComposeList,
  renderLeading,
  getSubtitle,
}: {
  sectionId: string
  title: string
  items: VCard[]
  totalCount: number
  bookId: string
  composeLabel: string
  onComposeContact: (contact: VCard) => void
  onComposeList: (list: VCard) => void
  renderLeading: (item: VCard) => React.ReactNode
  getSubtitle: (item: VCard) => string | undefined
}) {
  if (items.length === 0) return null

  return (
    <section data-testid={`fast-access-section-${sectionId}`}>
      <SectionHeader title={title} count={totalCount} />
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const emails = getDistributionListEmails(item)
          const contactEmails = item.emails?.filter(Boolean) ?? []
          const canCompose =
            sectionId === 'lists' ? emails.length > 0 : contactEmails.length > 0

          return (
            <EntryRow
              key={item.id}
              href={`/address_books/${bookId}/${item.id}`}
              title={getContactDisplayName(item)}
              subtitle={getSubtitle(item)}
              leading={renderLeading(item)}
              composeLabel={composeLabel}
              onCompose={
                canCompose
                  ? () =>
                      sectionId === 'lists'
                        ? onComposeList(item)
                        : onComposeContact(item)
                  : undefined
              }
              testId={
                sectionId === 'lists'
                  ? 'fast-access-distribution-list-row'
                  : 'fast-access-contact-row'
              }
            />
          )
        })}
      </div>
    </section>
  )
}

const AddressBookContent: React.FC = () => {
  const t = useTranslations('NAVIGATION.fast_access.address_book')
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: addressBooks, isLoading: booksLoading, isError } =
    useGetAddressBooksQuery()

  const defaultBook = useMemo(() => {
    const personals = addressBooks?.personals ?? []
    const defaultId = resolveDefaultBookId(personals)
    if (!defaultId) return null
    return personals.find((book) => book.id === defaultId) ?? null
  }, [addressBooks?.personals])

  const { data: entries = [], isLoading: contactsLoading } =
    useGetAddressBookVCardsQuery(defaultBook?.id ?? '', {
      skip: !defaultBook?.id,
    })

  const { distributionLists, contacts } = useMemo(
    () => partitionAddressBookEntries(entries, searchQuery, 'asc'),
    [entries, searchQuery]
  )

  const isSearching = searchQuery.trim().length > 0
  const visibleLists = distributionLists.slice(
    0,
    isSearching ? distributionLists.length : LIST_SECTION_LIMIT
  )
  const visibleContacts = contacts.slice(
    0,
    isSearching ? contacts.length : CONTACT_SECTION_LIMIT
  )

  const hasAnyEntry = distributionLists.length > 0 || contacts.length > 0
  const hasVisibleEntry = visibleLists.length > 0 || visibleContacts.length > 0

  const isLoading = booksLoading || contactsLoading
  const bookHref = defaultBook
    ? `/address_books/${defaultBook.id}`
    : '/address_books'

  const handleComposeContact = useCallback(
    (contact: VCard) => {
      const email = contact.emails?.find(Boolean)
      if (!email) return

      dispatch(
        createDraft({
          id: `compose-${Date.now()}`,
          initialData: {
            to: [
              {
                email,
                name: getContactDisplayName(contact),
              },
            ],
          },
        })
      )
    },
    [dispatch]
  )

  const handleComposeList = useCallback(
    (list: VCard) => {
      const emails = getDistributionListEmails(list)
      if (!emails.length) return

      const displayName = getContactDisplayName(list)
      dispatch(
        createDraft({
          id: `compose-${Date.now()}`,
          initialData: {
            to: emails.map((email) => ({
              email,
              name: displayName,
            })),
          },
        })
      )
    },
    [dispatch]
  )

  const listSubtitle = useCallback(
    (list: VCard) =>
      t('member_count', { number: getDistributionListMemberCount(list) }),
    [t]
  )

  return (
    <SidebarGroupContent
      className="flex flex-1 flex-col gap-3 overflow-hidden p-2"
      data-testid="address-book-panel"
    >
      <div className="flex shrink-0 flex-col gap-2 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-sm font-medium">{t('title')}</span>
            {defaultBook && (
              <p className="text-muted-foreground truncate text-xs">
                {defaultBook.name}
              </p>
            )}
          </div>
          <Button variant="link" size="sm" className="h-auto shrink-0 p-0" asChild>
            <Link href={bookHref}>{t('view_all')}</Link>
          </Button>
        </div>

        {defaultBook && (
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('search_placeholder')}
              className={cn('h-8 pl-8 text-sm')}
              data-testid="fast-access-contacts-search"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      <div className="scrollbar-thin-gray flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        {isLoading && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('loading')}</p>
        )}

        {!isLoading && isError && (
          <p className="text-destructive px-2 py-3 text-xs">{t('error')}</p>
        )}

        {!isLoading && !isError && !defaultBook && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('empty')}</p>
        )}

        {!isLoading && !isError && defaultBook && !hasAnyEntry && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('no_entries')}</p>
        )}

        {!isLoading && !isError && defaultBook && hasAnyEntry && !hasVisibleEntry && (
          <p className="text-muted-foreground px-2 py-3 text-xs">{t('no_results')}</p>
        )}

        {!isLoading && !isError && defaultBook && hasVisibleEntry && (
          <>
            <AddressBookSection
              sectionId="lists"
              title={t('distribution_lists')}
              items={visibleLists}
              totalCount={distributionLists.length}
              bookId={defaultBook.id}
              composeLabel={t('compose')}
              onComposeContact={handleComposeContact}
              onComposeList={handleComposeList}
              renderLeading={() => <DistributionListLeading />}
              getSubtitle={listSubtitle}
            />
            <AddressBookSection
              sectionId="contacts"
              title={t('contacts')}
              items={visibleContacts}
              totalCount={contacts.length}
              bookId={defaultBook.id}
              composeLabel={t('compose')}
              onComposeContact={handleComposeContact}
              onComposeList={handleComposeList}
              renderLeading={(item) => <ContactLeading contact={item} />}
              getSubtitle={getContactSubtitle}
            />
          </>
        )}
      </div>
    </SidebarGroupContent>
  )
}

export default memo(AddressBookContent)
