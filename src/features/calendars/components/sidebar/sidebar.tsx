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
import {
  isPersonalCalendar,
  isSharedCalendar,
  isSubscriptionCalendar,
} from '@/features/calendars/utils/calendar-source-type'
import { useGetCalendarsQuery } from '../../store/calendars-api'
import CreateEventOpener from './create-event-opener'
import AddCalendar from './forms/add'
import AddExternalCalendar from './forms/add-external'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetCalendarsQuery()
  const t = useTranslations('CALENDARS')

  const groupedCalendars = useMemo(() => {
    const calendars = data ?? []
    return {
      personals: calendars.filter(isPersonalCalendar),
      shared: calendars.filter(isSharedCalendar),
      subscriptions: calendars.filter(isSubscriptionCalendar),
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
                isDefault={calendar.is_default}
                id={calendar.key ?? calendar.id ?? ''}
                calendarKey={calendar.key ?? calendar.id}
                sourceType={calendar.source_type}
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
              calendarKey={calendar.key ?? calendar.id}
              sourceType={calendar.source_type}
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
        <AddExternalCalendar />
        <SidebarMenu>
          {subscriptions.map((calendar) => (
            <SidebarItem
              key={calendar.key ?? calendar.id}
              icon="calendar"
              id={calendar.key ?? calendar.id ?? ''}
              calendarKey={calendar.key ?? calendar.id}
              sourceType={calendar.source_type}
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
