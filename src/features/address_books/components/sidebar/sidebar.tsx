'use client'

import Droppable from '@/components/dnd/droppable'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGetAddressBooksQuery } from '../../store/address-books-api'
import AddAddressBook from './forms/add'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetAddressBooksQuery()
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  if (isFetching) {
    return <SidebarSkeleton />
  }
  const { globals = [], personals = [], subscriptions = [] } = data || {}
  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('personals.string')}</SidebarGroupLabel>
        <AddAddressBook type={'personals'} />
        <SidebarGroupContent>
          <SidebarMenu>
            {personals.map((book) => (
              <Droppable key={book.id} id={book.id}>
                <SidebarItem
                  icon="contact-2"
                  isDefault={book.default}
                  id={book.id}
                  name={book.name}
                  onClick={() => {}}
                />
              </Droppable>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('subscriptions.string')}</SidebarGroupLabel>
        <AddAddressBook type={'subscriptions'} />
        <SidebarMenu>
          {subscriptions.map((book) => (
            <SidebarItem
              key={book.id}
              icon="contact-2"
              isDefault={book.default}
              importAction={false}
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

export default Sidebar
