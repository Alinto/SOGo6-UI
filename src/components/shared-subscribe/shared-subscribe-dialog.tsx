'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarGroupAction } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import RecipientAvatar from '@/features/address_books/components/recipient-avatar'
import { cn } from '@/lib/utils'
import { skipToken } from '@reduxjs/toolkit/query'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import React, { memo, useCallback, useEffect, useId, useState } from 'react'
import type {
  SharedSubscribeDialogProps,
  SharedSubscribeItem,
  SharedSubscribeLabels,
  SharedSubscribeUser,
} from './types'

export const SHARED_USERS_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300
const SKELETON_ROWS = 4
const OWNER_SKELETON_ROWS = 2

type OwnerItemsProps = {
  id: string
  owner: string
  labels: SharedSubscribeLabels
  pendingKey: string | null
  useOwnerItems: SharedSubscribeDialogProps['useOwnerItems']
  renderItemIcon: SharedSubscribeDialogProps['renderItemIcon']
  onSubscribe: (key: string) => void
}

/** Items of one owner, fetched (not paginated) when the owner is expanded. */
const SharedOwnerItems = memo(function SharedOwnerItems({
  id,
  owner,
  labels,
  pendingKey,
  useOwnerItems,
  renderItemIcon,
  onSubscribe,
}: OwnerItemsProps) {
  const { items, isError } = useOwnerItems(owner)

  if (!items) {
    return isError ? (
      <p id={id} role="alert" className="text-destructive mb-2 ml-12 text-sm">
        {labels.ownerItemsError}
      </p>
    ) : (
      <div
        id={id}
        role="status"
        aria-label={labels.ownerItemsLoading}
        className="mt-1 mb-2 ml-12 space-y-1"
      >
        {Array.from({ length: OWNER_SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <p id={id} className="text-muted-foreground mb-2 ml-12 text-sm">
        {labels.ownerItemsEmpty}
      </p>
    )
  }
  return (
    <ul id={id} className="mt-1 mb-2 ml-12 space-y-1">
      {items.map((item: SharedSubscribeItem) => (
        <li
          key={item.key}
          className="flex items-center gap-2 rounded-md px-2 py-1"
        >
          {renderItemIcon(item)}
          <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
          {item.subscribed ? (
            <Button size="sm" variant="outline" disabled>
              {labels.subscribed}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={pendingKey !== null}
              aria-busy={pendingKey === item.key}
              onClick={() => onSubscribe(item.key)}
            >
              {labels.subscribe}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
})

type OwnerRowProps = Omit<OwnerItemsProps, 'id' | 'owner'> & {
  user: SharedSubscribeUser
  expanded: boolean
  onToggle: (owner: string) => void
}

const SharedOwnerRow = memo(function SharedOwnerRow({
  user,
  expanded,
  onToggle,
  ...itemsProps
}: OwnerRowProps) {
  const listId = useId()

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        onClick={() => onToggle(user.owner)}
        className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none focus-visible:ring-2"
      >
        <RecipientAvatar email={user.owner} name={user.username} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {user.username}
          </span>
          {user.username !== user.owner ? (
            <span className="text-muted-foreground block truncate text-xs">
              {user.owner}
            </span>
          ) : null}
        </span>
        <ChevronRight
          aria-hidden
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
            expanded && 'rotate-90'
          )}
        />
      </button>

      {expanded ? (
        <SharedOwnerItems id={listId} owner={user.owner} {...itemsProps} />
      ) : null}
    </li>
  )
})

const INITIAL_QUERY = { search: '', page: 1 }
const USERS_QUERY_OPTIONS = { refetchOnMountOrArgChange: true }

/**
 * Sidebar "+" dialog listing, page by page, the users who share items with
 * us; expanding a user loads their items, each with a Subscribe button.
 */
const SharedSubscribeDialog: React.FC<SharedSubscribeDialogProps> = ({
  labels,
  useUsers,
  useOwnerItems,
  onSubscribe,
  renderItemIcon,
  pageSize = SHARED_USERS_PAGE_SIZE,
}) => {
  const searchId = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Search and page change together so a new search starts on page 1 in a
  // single request.
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [expandedOwners, setExpandedOwners] = useState<Set<string>>(
    () => new Set()
  )
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = search.trim()
    const timeout = setTimeout(
      () =>
        setQuery((current) =>
          current.search === trimmed ? current : { search: trimmed, page: 1 }
        ),
      SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timeout)
  }, [search])

  // Opening the dialog swaps `skipToken` for a real arg, so with
  // `refetchOnMountOrArgChange` each click on "+" fetches a fresh list.
  const { data, currentData, isFetching, isError } = useUsers(
    open
      ? { page: query.page, page_size: pageSize, search: query.search }
      : skipToken,
    USERS_QUERY_OPTIONS
  )

  const users = currentData?.users ?? []
  // `data` keeps the last result while the next page loads, so the
  // pagination stays visible instead of flickering.
  const totalPages =
    data?.total_pages ??
    (data?.total_count === undefined
      ? undefined
      : Math.ceil(data.total_count / pageSize))
  // Without any total (no X-Pagination header), a full page means there may
  // be another one.
  const hasNextPage =
    totalPages === undefined
      ? (data?.users.length ?? 0) >= pageSize
      : query.page < totalPages

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setSearch('')
      setQuery(INITIAL_QUERY)
      setExpandedOwners(new Set())
    }
  }

  const goToPage = (page: number) =>
    setQuery((current) => ({ ...current, page }))

  const handleToggle = useCallback((owner: string) => {
    setExpandedOwners((previous) => {
      const next = new Set(previous)
      if (next.has(owner)) {
        next.delete(owner)
      } else {
        next.add(owner)
      }
      return next
    })
  }, [])

  const handleSubscribe = useCallback(
    async (key: string) => {
      setPendingKey(key)
      try {
        await onSubscribe(key)
      } catch {
        // The caller's mutation notifies the error.
      } finally {
        setPendingKey(null)
      }
    },
    [onSubscribe]
  )

  const renderContent = () => {
    if (!currentData && isFetching) {
      return (
        <div role="status" aria-label={labels.loading} className="space-y-2">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      )
    }
    if (isError && !currentData) {
      return (
        <p role="alert" className="text-destructive py-6 text-center text-sm">
          {labels.error}
        </p>
      )
    }
    if (users.length === 0) {
      return (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {labels.empty}
        </p>
      )
    }
    return (
      <ul className="space-y-1">
        {users.map((user) => (
          <SharedOwnerRow
            key={user.owner}
            user={user}
            expanded={expandedOwners.has(user.owner)}
            labels={labels}
            pendingKey={pendingKey}
            useOwnerItems={useOwnerItems}
            renderItemIcon={renderItemIcon}
            onToggle={handleToggle}
            onSubscribe={handleSubscribe}
          />
        ))}
      </ul>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <SidebarGroupAction title={labels.addTitle}>
          <Plus />
          <span className="sr-only">{labels.addTitle}</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-[calc(100vw-2rem)] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.addTitle}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={searchId}>{labels.searchLabel}</Label>
          <Input
            id={searchId}
            type="search"
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
          />
        </div>

        <div
          aria-busy={isFetching}
          className="scrollbar-thin-gray min-h-0 flex-1 overflow-y-auto"
        >
          {renderContent()}
        </div>

        {query.page > 1 || hasNextPage ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={query.page <= 1 || isFetching}
              aria-label={labels.previousPage}
              onClick={() => goToPage(Math.max(1, query.page - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground text-sm tabular-nums">
              {totalPages === undefined
                ? labels.currentPage(query.page)
                : labels.page(query.page, Math.max(1, totalPages))}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasNextPage || isFetching}
              aria-label={labels.nextPage}
              onClick={() => goToPage(query.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default memo(SharedSubscribeDialog)
