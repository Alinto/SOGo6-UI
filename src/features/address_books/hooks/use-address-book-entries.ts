'use client'

import { useContactSearchMinLength } from '../hooks/use-contact-search-min-length'
import type { BookEntriesQueryParams, BookEntriesResponse } from '../address-books-api-types'
import { useGetAddressBookVCardsQuery } from '../store/address-books-api'
import { selectAddressBooksUi } from '../store/address-books-ui-slice'
import { useAppSelector } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'

export function useAddressBookEntries(bookId: string | null | undefined) {
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

  const queryArg = bookId
    ? { bookId, params: shouldSkipSearch ? { ...params, search: undefined } : params }
    : skipToken

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAddressBookVCardsQuery(queryArg)

  const entries = data?.items ?? []
  const contactTotal = data?.contactTotal ?? data?.total ?? 0
  const listTotal = data?.listTotal ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? page

  return {
    items: entries,
    total: contactTotal,
    contactTotal,
    listTotal,
    page: currentPage,
    totalPages,
    isLoading,
    isFetching,
    isError,
    refetch,
    searchTooShort: shouldSkipSearch && trimmedSearch.length > 0,
    minSearchLength,
  }
}

export function selectBookEntriesItems(
  data: BookEntriesResponse | undefined
): BookEntriesResponse['items'] {
  return data?.items ?? []
}
