'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { skipToken } from '@reduxjs/toolkit/query'
import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { useGetAddressBooksQuery, useGetVCardQuery } from '../store/address-books-api'
import {
  selectAddressBooksUi,
  setFormBookId,
} from '../store/address-books-ui-slice'
import { resolveDefaultBookId } from '../utils/resolve-default-book'

export function useAddressBookState() {
  const dispatch = useAppDispatch()
  const params = useParams()
  const routeBookId =
    typeof params?.book_id === 'string' ? params.book_id : null

  const ui = useAppSelector(selectAddressBooksUi)
  const {
    data: addressBooks,
    isLoading: isBooksLoading,
    isError: isBooksError,
  } = useGetAddressBooksQuery()

  const defaultBookId = useMemo(
    () => resolveDefaultBookId(addressBooks?.personals ?? []),
    [addressBooks?.personals]
  )

  const activeBookId = ui.formBookId ?? routeBookId ?? defaultBookId

  useEffect(() => {
    if (routeBookId) {
      dispatch(setFormBookId(routeBookId))
    }
  }, [dispatch, routeBookId])

  return {
    routeBookId,
    activeBookId,
    defaultBookId,
    addressBooks,
    isBooksLoading,
    isBooksError,
    ui,
  }
}

export function useAddressBookEditState(
  editingId: string | null,
  activeBookId: string | null,
  isFormOpen: boolean
) {
  const {
    currentData: editingEntity,
    isFetching,
    isError,
  } = useGetVCardQuery(
    editingId && activeBookId
      ? { id: editingId, book_id: activeBookId }
      : skipToken
  )

  return {
    editingEntity,
    isEditLoading: Boolean(
      editingId && isFormOpen && isFetching && !editingEntity
    ),
    isEditLoadError: Boolean(
      editingId && isFormOpen && isError && !editingEntity
    ),
  }
}
