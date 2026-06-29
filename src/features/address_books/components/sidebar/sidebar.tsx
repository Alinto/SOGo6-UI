'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ALL_CONTACTS_BOOK_ID } from '@/features/address_books/address-books-constants'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Contact2 } from 'lucide-react'
import React, { memo } from 'react'
import { useGetAddressBooksQuery } from '../../store/address-books-api'
import AddAddressBook from './forms/add'
import CreateContactOpener from './create-contact-opener'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

function Sidebar() {
  const { data, isFetching, isError } = useGetAddressBooksQuery()
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const tForm = useTranslations('CONTACT_FORM')
  const { push } = useRouter()

  if (isFetching) {
    return <SidebarSkeleton />
  }

  if (isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        {tForm('load_error.list.string')}
      </div>
    )
  }

  const { globals = [], personals = [], subscriptions = [] } = data || {}
  return (
    <>
      <SidebarGroup className="sticky top-0 z-10 ml-0 px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <CreateContactOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('personals.string')}</SidebarGroupLabel>
        <AddAddressBook type={'personals'} />
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-10"
                onClick={() => push(`/address_books/${ALL_CONTACTS_BOOK_ID}`)}
                tooltip={t('all_contacts.string')}
              >
                <Contact2 />
                <span className="truncate">{t('all_contacts.string')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {personals.map((book) => (
              <SidebarItem
                key={book.id}
                icon="contact-2"
                isDefault={book.default}
                id={book.id}
                name={book.name}
                onClick={() => {}}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('subscriptions.string')}</SidebarGroupLabel>
        <SidebarMenu>
          {subscriptions.map((book) => (
            <SidebarItem
              key={book.id}
              icon="contact-2"
              isDefault={book.default}
              importAction={false}
              writable={false}
              editAction={false}
              id={book.id}
              name={book.name}
              onClick={() => {}}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('globals.string')}</SidebarGroupLabel>
        <SidebarMenu>
          {globals.map((book) => (
            <SidebarItem
              key={book.id}
              icon="globe"
              name={book.name}
              id={book.id}
              onClick={() => {}}
              disableActions
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default memo(Sidebar)
