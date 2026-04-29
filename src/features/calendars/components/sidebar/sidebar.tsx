'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'
import { useGetCalendarsQuery } from '../../store/calendars-api'
import CreateEventOpener from './create-event-opener'
import AddCalendar from './forms/add'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetCalendarsQuery()
  const t = useTranslations('CALENDARS')

  const groupedCalendars = useMemo(() => {
    const calendars = data ?? []
    return {
      personals: calendars.filter(
        (calendar) =>
          calendar.type === 'personal' ||
          calendar.source_type === 'personal' ||
          (!calendar.type &&
            calendar.source_type !== 'shared' &&
            calendar.source_type !== 'subscription')
      ),
      shared: calendars.filter(
        (calendar) =>
          calendar.type === 'shared' || calendar.source_type === 'shared'
      ),
      subscriptions: calendars.filter(
        (calendar) =>
          calendar.type === 'subscription' ||
          calendar.source_type === 'subscription'
      ),
    }
  }, [data])

  if (isFetching) {
    return <SidebarSkeleton />
  }

  const { personals, shared, subscriptions } = groupedCalendars

  return (
    <>
      <SidebarGroup className="sticky top-0 z-10 ml-0 px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <CreateEventOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <AddCalendar type="personals" />
        <SidebarGroupContent>
          <SidebarMenu>
            {personals.map((calendar) => (
              <SidebarItem
                key={calendar.key ?? calendar.id}
                icon="calendar"
                isDefault={calendar.is_default ?? calendar.default}
                id={calendar.key ?? calendar.id ?? ''}
                name={calendar.name}
                color={calendar.color}
                onClick={() => {}}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{t('sidebar.shared.string')}</SidebarGroupLabel>
        <SidebarMenu>
          {shared.map((calendar) => (
            <SidebarItem
              key={calendar.key ?? calendar.id}
              icon="calendar"
              id={calendar.key ?? calendar.id ?? ''}
              name={calendar.name}
              color={calendar.color}
              onClick={() => {}}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel>
          {t('sidebar.subscriptions.string')}
        </SidebarGroupLabel>
        <AddCalendar type="subscriptions" />
        <SidebarMenu>
          {subscriptions.map((calendar) => (
            <SidebarItem
              key={calendar.key ?? calendar.id}
              icon="calendar"
              id={calendar.key ?? calendar.id ?? ''}
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

export default memo(Sidebar)
