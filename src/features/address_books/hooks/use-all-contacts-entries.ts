'use client'

import type { BookEntriesQueryParams } from '../address-books-api-types'
import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import { useSearchAllContactsQuery } from '../store/address-books-api'
import { selectAddressBooksUi } from '../store/address-books-ui-slice'
import { useContactSearchMinLength } from './use-contact-search-min-length'
import { useAppSelector } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'

export function useAllContactsEntries(enabled = true) {
  const minSearchLength = useContactSearchMinLength()
  const { searchQuery, sortOrder, sortBy, page, pageSize } = useAppSelector(
    selectAddressBooksUi
  )

  const trimmedSearch = searchQuery.trim()
  const shouldSkipSearch =
    trimmedSearch.length > 0 && trimmedSearch.length < minSearchLength

  const params = useMemo<BookEntriesQueryParams>(
    () => ({
      search: trimmedSearch || undefined,
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [trimmedSearch, page, pageSize, sortBy, sortOrder]
  )

  const { data, isLoading, isFetching, isError, refetch } =
    useSearchAllContactsQuery(
      enabled
        ? {
            params: shouldSkipSearch ? { ...params, search: undefined } : params,
            minSearchLength,
          }
        : skipToken
    )

  return {
    items: data?.items ?? [],
    total: data?.contactTotal ?? data?.total ?? 0,
    contactTotal: data?.contactTotal ?? data?.total ?? 0,
    listTotal: 0,
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isFetching,
    isError,
    refetch,
    searchTooShort: shouldSkipSearch && trimmedSearch.length > 0,
    minSearchLength,
    bookId: ALL_CONTACTS_BOOK_ID,
  }
}
