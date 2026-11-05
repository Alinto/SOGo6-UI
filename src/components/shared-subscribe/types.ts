import type { SkipToken } from '@reduxjs/toolkit/query'
import type { ReactNode } from 'react'

/** User sharing at least one item (calendar, address book…) with us. */
export type SharedSubscribeUser = {
  /** Owner email, used to fetch the owner's items. */
  owner: string
  username: string
}

/** One shared item of an owner, with its subscription state. */
export type SharedSubscribeItem = {
  key: string
  name: string
  subscribed: boolean
  color?: string | null
}

export type SharedSubscribeUsersArg = {
  page: number
  page_size: number
  search: string
}

export type SharedSubscribeUsersPage = {
  users: SharedSubscribeUser[]
  /** From the `X-Pagination` header; absent when the backend does not send it. */
  total_count?: number
  total_pages?: number
}

/** Subset of the RTK Query hook options used by the dialog. */
export type SharedSubscribeUsersOptions = {
  refetchOnMountOrArgChange?: boolean | number
}

/** Subset of an RTK Query hook result used by the dialog. */
export type SharedSubscribeUsersResult = {
  data?: SharedSubscribeUsersPage
  currentData?: SharedSubscribeUsersPage
  isFetching: boolean
  isError: boolean
}

export type SharedSubscribeOwnerItemsResult = {
  items?: SharedSubscribeItem[]
  isError: boolean
}

/** Every text of the dialog, already translated by the caller. */
export type SharedSubscribeLabels = {
  addTitle: string
  description: string
  searchLabel: string
  searchPlaceholder: string
  loading: string
  error: string
  empty: string
  subscribe: string
  subscribed: string
  ownerItemsLoading: string
  ownerItemsError: string
  ownerItemsEmpty: string
  previousPage: string
  nextPage: string
  /** "Page {page} of {total}" */
  page: (page: number, total: number) => string
  /** "Page {page}", when the total is unknown */
  currentPage: (page: number) => string
}

export type SharedSubscribeDialogProps = {
  labels: SharedSubscribeLabels
  /** Paginated list of users sharing items with us. */
  useUsers: (
    arg: SharedSubscribeUsersArg | SkipToken,
    options?: SharedSubscribeUsersOptions
  ) => SharedSubscribeUsersResult
  /** Items of one owner; only called while the owner is expanded. */
  useOwnerItems: (owner: string) => SharedSubscribeOwnerItemsResult
  onSubscribe: (key: string) => Promise<unknown>
  renderItemIcon: (item: SharedSubscribeItem) => ReactNode
  pageSize?: number
}
