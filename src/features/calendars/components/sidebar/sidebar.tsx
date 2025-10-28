'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGetCalendarsQuery } from '../../store/calendars-api'
import AddCalendar from './forms/add'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetCalendarsQuery()
  const t = useTranslations('CALENDARS')

  if (isFetching) {
    return <SidebarSkeleton />
  }

  const {
    personals = [],
    shared = [],
    subscriptions = [],
  } = data
    ? {
        personals: data.personal || [],
        shared: data.shared || [],
        subscriptions: data.subscriptions || [],
      }
    : { personals: [], shared: [], subscriptions: [] }

  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <AddCalendar type="personals" />
        <SidebarGroupContent>
          <SidebarMenu>
            {personals.map((calendar) => (
              <SidebarItem
                key={calendar.id}
                icon="calendar"
                isDefault={calendar.default}
                id={calendar.id}
                name={calendar.name}
                color={calendar.color}
                onClick={() => {}}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('sidebar.shared')}</SidebarGroupLabel>
        <SidebarMenu>
          {shared.map((calendar) => (
            <SidebarItem
              key={calendar.id}
              icon="calendar"
              id={calendar.id}
              name={calendar.name}
              color={calendar.color}
              onClick={() => {}}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('sidebar.subscriptions')}</SidebarGroupLabel>
        <AddCalendar type="subscriptions" />
        <SidebarMenu>
          {subscriptions.map((calendar) => (
            <SidebarItem
              key={calendar.id}
              icon="calendar"
              id={calendar.id}
              name={calendar.name}
              color={calendar.color}
              onClick={() => {}}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default Sidebar
