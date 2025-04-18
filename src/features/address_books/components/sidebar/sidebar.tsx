'use client'

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGetAddressBooksQuery } from '../../store/address-books-api'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetAddressBooksQuery()
  const t = useTranslations('Address_Books')
  if (isFetching) {
    return <SidebarSkeleton />
  }
  const { globals = [], personals = [], subscriptions = [] } = data || {}
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <SidebarGroupAction title={t('sidebar.add_personnal.string')}>
          <Plus />
          <span className="sr-only">{t('sidebar.add_personnal.string')}</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
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
      <SidebarGroup>
        <SidebarGroupLabel>
          {t('sidebar.subscriptions.string')}
        </SidebarGroupLabel>
        <SidebarGroupAction title={t('sidebar.add_subscriptions.string')}>
          <Plus />
          <span className="sr-only">
            <SidebarGroupLabel>
              {t('sidebar.add_subscriptions.string')}
            </SidebarGroupLabel>
          </span>
        </SidebarGroupAction>
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
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.globals.string')}</SidebarGroupLabel>
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
