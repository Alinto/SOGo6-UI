'use client'

import IconRail from '@/components/sidebar/icon-rail'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { Calendar } from '@/features/calendars/calendars-types'
import {
  isSharedWithMe,
  isSubscriptionCalendar,
} from '@/features/calendars/utils/calendar-source-type'
import { useIsIconRail } from '@/hooks/use-is-icon-rail'
import { useIsOtherOwner } from '@/hooks/use-is-other-owner'
import { sortByOwnerThenName } from '@/lib/utils/owner'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'
import { useGetCalendarsQuery } from '../../store/calendars-api'
import CreateEventOpener from './create-event-opener'
import AddCalendar from './forms/add'
import AddExternalCalendar from './forms/add-external'
import SubscribeSharedCalendar from './forms/subscribe-shared'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

type CalendarSection = 'personals' | 'shared' | 'subscriptions'

const SECTIONS: CalendarSection[] = ['personals', 'shared', 'subscriptions']

function renderCalendar(calendar: Calendar, section: CalendarSection) {
  return (
    <SidebarItem
      key={calendar.key ?? calendar.id}
      icon="calendar"
      isDefault={section === 'personals' ? calendar.is_default : undefined}
      id={calendar.key ?? calendar.id ?? ''}
      calendarKey={calendar.key ?? calendar.id}
      sourceType={calendar.source_type}
      name={calendar.name}
      color={calendar.color}
      owner={section === 'shared' ? calendar.owner : undefined}
      publicUrl={calendar.public_url}
      isShared={section === 'shared' ? true : undefined}
      onClick={() => {}}
    />
  )
}

const Sidebar: React.FC = () => {
  const { data, isFetching } = useGetCalendarsQuery()
  const t = useTranslations('CALENDARS')
  const isOtherOwner = useIsOtherOwner()
  // Icon rail (desktop, collapsed): calendars only, sections split by a line.
  const isIconRail = useIsIconRail()

  const groupedCalendars = useMemo(() => {
    const calendars = data ?? []
    // Anything that is neither shared nor a subscription is a personal calendar.
    const isShared = (calendar: Calendar) =>
      isSharedWithMe(calendar, isOtherOwner)
    const nonSubscriptions = calendars.filter(
      (calendar) => !isSubscriptionCalendar(calendar)
    )
    return {
      personals: nonSubscriptions.filter((calendar) => !isShared(calendar)),
      shared: sortByOwnerThenName(nonSubscriptions.filter(isShared)),
      subscriptions: calendars.filter(isSubscriptionCalendar),
    }
  }, [data, isOtherOwner])

  // Skeleton on the first load only: a refetch (e.g. after subscribing to a
  // shared calendar) must keep the sidebar, and its open dialogs, mounted.
  if (!data && isFetching) {
    return <SidebarSkeleton />
  }

  const { personals, shared, subscriptions } = groupedCalendars

  const createEventGroup = (
    <SidebarGroup className="sticky top-0 z-10 ml-0 px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateEventOpener />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )

  if (isIconRail) {
    return (
      <>
        {createEventGroup}
        <IconRail
          sections={SECTIONS.map((section) =>
            groupedCalendars[section].map((calendar) =>
              renderCalendar(calendar, section)
            )
          )}
          moreLabel={(count) => t('sidebar.railMore.string', { count })}
        />
      </>
    )
  }

  return (
    <>
      {createEventGroup}

      <SidebarGroup className="group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel>{t('sidebar.personals.string')}</SidebarGroupLabel>
        <AddCalendar type="personals" />
        <SidebarGroupContent>
          <SidebarMenu>
            {personals.map((calendar) => renderCalendar(calendar, 'personals'))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel>{t('sidebar.shared.string')}</SidebarGroupLabel>
        <SubscribeSharedCalendar />
        <SidebarMenu>
          {shared.map((calendar) => renderCalendar(calendar, 'shared'))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="pb-4 group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel>
          {t('sidebar.subscriptions.string')}
        </SidebarGroupLabel>
        <AddExternalCalendar />
        <SidebarMenu>
          {subscriptions.map((calendar) =>
            renderCalendar(calendar, 'subscriptions')
          )}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default memo(Sidebar)
