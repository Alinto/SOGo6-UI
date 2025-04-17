'use client'

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGetAddressBooksQuery } from '../../store/address-books-api'
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
              <SidebarMenuButton className="h-10" key={book.id}>
                {book.name}
              </SidebarMenuButton>
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
            <SidebarMenuButton className="h-10" key={book.id}>
              {book.name}
            </SidebarMenuButton>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>{t('sidebar.globals.string')}</SidebarGroupLabel>
        <SidebarMenu>
          {globals.map((book) => (
            <SidebarMenuButton className="h-10" key={book.id}>
              {book.name}
            </SidebarMenuButton>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default Sidebar
