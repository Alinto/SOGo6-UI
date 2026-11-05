'use client'

import SharedSubscribeDialog from '@/components/shared-subscribe/shared-subscribe-dialog'
import type {
  SharedSubscribeItem,
  SharedSubscribeLabels,
  SharedSubscribeOwnerItemsResult,
} from '@/components/shared-subscribe/types'
import {
  useGetSharedAddressBookUsersQuery,
  useGetSharedAddressBooksByOwnerQuery,
  useUpdateSharedAddressBookSubscriptionMutation,
} from '@/features/address_books/store/address-books-api'
import { Contact2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useCallback, useMemo } from 'react'

/** Address books shared by one owner, in the generic dialog's shape. */
function useOwnerAddressBooks(owner: string): SharedSubscribeOwnerItemsResult {
  const { data, isError } = useGetSharedAddressBooksByOwnerQuery(owner)
  const items = useMemo(
    () =>
      data?.map(
        (book): SharedSubscribeItem => ({
          key: book.key,
          name: book.name,
          subscribed: book.subscribed,
        })
      ),
    [data]
  )
  return { items, isError }
}

const renderAddressBookIcon = () => (
  <Contact2 aria-hidden className="text-muted-foreground h-4 w-4 shrink-0" />
)

const SubscribeSharedAddressBook: React.FC = () => {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const [updateSubscription] = useUpdateSharedAddressBookSubscriptionMutation()

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
      useUsers={useGetSharedAddressBookUsersQuery}
      useOwnerItems={useOwnerAddressBooks}
      onSubscribe={handleSubscribe}
      renderItemIcon={renderAddressBookIcon}
    />
  )
}

export default memo(SubscribeSharedAddressBook)
