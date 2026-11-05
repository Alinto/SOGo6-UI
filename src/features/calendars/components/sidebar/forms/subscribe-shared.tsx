'use client'

import SharedSubscribeDialog from '@/components/shared-subscribe/shared-subscribe-dialog'
import type {
  SharedSubscribeItem,
  SharedSubscribeLabels,
  SharedSubscribeOwnerItemsResult,
} from '@/components/shared-subscribe/types'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import {
  useGetSharedCalendarUsersQuery,
  useGetSharedCalendarsByOwnerQuery,
  useUpdateSharedCalendarSubscriptionMutation,
} from '@/features/calendars/store/calendars-api'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback, useMemo } from 'react'

/** Calendars shared by one owner, in the generic dialog's shape. */
function useOwnerCalendars(owner: string): SharedSubscribeOwnerItemsResult {
  const { data, isError } = useGetSharedCalendarsByOwnerQuery(owner)
  const items = useMemo(
    () =>
      data?.map(
        (calendar): SharedSubscribeItem => ({
          key: calendar.key ?? calendar.id ?? '',
          name: calendar.name,
          subscribed: calendar.subscribed,
          color: calendar.color,
        })
      ),
    [data]
  )
  return { items, isError }
}

const renderCalendarIcon = (item: SharedSubscribeItem) => (
  <span
    aria-hidden
    className="h-3 w-3 shrink-0 rounded-full"
    style={{ backgroundColor: item.color || DEFAULT_CALENDAR_COLOR }}
  />
)

const SubscribeSharedCalendar: React.FC = () => {
  const t = useTranslations('CALENDARS')
  const [updateSubscription] = useUpdateSharedCalendarSubscriptionMutation()

  const labels = useMemo(
    (): SharedSubscribeLabels => ({
      addTitle: t('shared_subscribe.add_title.string'),
      description: t('shared_subscribe.description.string'),
      searchLabel: t('shared_subscribe.search_label.string'),
      searchPlaceholder: t('shared_subscribe.search_placeholder.string'),
      loading: t('shared_subscribe.loading.string'),
      error: t('shared_subscribe.error.string'),
      empty: t('shared_subscribe.empty.string'),
      subscribe: t('shared_subscribe.subscribe.string'),
      subscribed: t('shared_subscribe.subscribed.string'),
      ownerItemsLoading: t('shared_subscribe.owner_items.loading.string'),
      ownerItemsError: t('shared_subscribe.owner_items.error.string'),
      ownerItemsEmpty: t('shared_subscribe.owner_items.empty.string'),
      previousPage: t('shared_subscribe.pagination.previous.string'),
      nextPage: t('shared_subscribe.pagination.next.string'),
      page: (page, total) =>
        t('shared_subscribe.pagination.page.string', { page, total }),
      currentPage: (page) =>
        t('shared_subscribe.pagination.current.string', { page }),
    }),
    [t]
  )

  const handleSubscribe = useCallback(
    (key: string) => updateSubscription({ key, subscribe: true }).unwrap(),
    [updateSubscription]
  )

  return (
    <SharedSubscribeDialog
      labels={labels}
      useUsers={useGetSharedCalendarUsersQuery}
      useOwnerItems={useOwnerCalendars}
      onSubscribe={handleSubscribe}
      renderItemIcon={renderCalendarIcon}
    />
  )
}

export default memo(SubscribeSharedCalendar)
