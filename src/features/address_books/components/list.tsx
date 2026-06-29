'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Loader2, Trash2, Users, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { memo, useMemo, useState } from 'react'
import type { ContactSortField } from '../address-books-api-types'
import { VCard } from '../address-books-types'
import {
  useDeleteVCardFromAddressBookMutation,
  useGetAddressBooksQuery,
} from '../store/address-books-api'
import {
  openCreateListForm,
  selectAddressBooksUi,
  setSearchQuery,
  setSortBy,
  toggleSortOrder,
} from '../store/address-books-ui-slice'
import { useActiveAddressBookWritable } from '../hooks/use-active-address-book'
import { partitionAddressBookEntries } from '../utils/contact-list'
import {
  isIndividualContact,
  membersFromContacts,
} from '../utils/distribution-list'
import ListSection from './list-section'
import AddressBookEmptyState from './address-book-empty-state'
import AddressBookListPagination from './list-pagination'

interface AddressBookListProps {
  items: VCard[]
  isFetching?: boolean
  serverSide?: boolean
  totalPages?: number
  currentPage?: number
  contactTotal?: number
  listTotal?: number
  searchTooShort?: boolean
  allContactsView?: boolean
}

const SORT_FIELDS: ContactSortField[] = [
  'display_name',
  'last_name',
  'first_name',
  'organization',
  'created_at',
  'updated_at',
]

function EntriesSummary({
  listCount,
  contactCount,
}: {
  listCount: number
  contactCount: number
}) {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const parts: string[] = []

  if (listCount > 0) {
    parts.push(t('lists_count.string', { number: listCount }))
  }
  if (contactCount > 0) {
    parts.push(t('contacts_number.string', { number: contactCount }))
  }

  return <span className="text-sm">{parts.join(' · ')}</span>
}

function AddressBookList({
  items,
  isFetching = false,
  serverSide = false,
  totalPages = 1,
  currentPage = 1,
  contactTotal,
  listTotal,
  searchTooShort = false,
  allContactsView = false,
}: AddressBookListProps) {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const tForm = useTranslations('CONTACT_FORM')
  const { writable } = useActiveAddressBookWritable()
  const params = useParams()
  const dispatch = useAppDispatch()
  const contact_id = params?.contact_id as string | undefined
  const book_id = params?.book_id as string

  const { searchQuery, sortOrder, sortBy } = useAppSelector(selectAddressBooksUi)
  const [deleteContact, { isLoading: isDeleting }] =
    useDeleteVCardFromAddressBookMutation()
  const { data: addressBooks } = useGetAddressBooksQuery(undefined, {
    skip: !allContactsView,
  })

  const [selectedItems, setSelectedItems] = React.useState<VCard[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const sourceBookNamesById = useMemo(() => {
    if (!addressBooks) return {} as Record<string, string>
    const map: Record<string, string> = {}
    for (const book of [
      ...addressBooks.personals,
      ...addressBooks.subscriptions,
      ...addressBooks.globals,
    ]) {
      map[book.id] = book.name
    }
    return map
  }, [addressBooks])

  const { distributionLists, contacts } = useMemo(
    () =>
      partitionAddressBookEntries(items, searchQuery, sortOrder, {
        serverSide,
      }),
    [items, searchQuery, sortOrder, serverSide]
  )

  const totalDisplayed = distributionLists.length + contacts.length
  const isSearchActive = searchQuery.trim().length > 0
  const isBookEmpty = items.length === 0 && !isSearchActive && !searchTooShort
  const summaryListCount = serverSide
    ? (listTotal ?? distributionLists.length)
    : distributionLists.length
  const summaryContactCount = serverSide
    ? (contactTotal ?? contacts.length)
    : contacts.length
  const hasSummaryCounts = summaryListCount + summaryContactCount > 0
  const showPagination = totalDisplayed > 0
  const canCreateFromEmpty = writable && !allContactsView

  const handleCheckboxClick = (e: React.MouseEvent, item: VCard) => {
    e.stopPropagation()
    setSelectedItems((prev) =>
      prev.some((selected) => selected.id === item.id)
        ? prev.filter((selected) => selected.id !== item.id)
        : [...prev, item]
    )
  }

  const handleDeselectAll = () => {
    setSelectedItems([])
  }

  const handleToggleSort = () => {
    dispatch(toggleSortOrder())
  }

  const handleSortByChange = (value: string) => {
    dispatch(setSortBy(value as ContactSortField))
  }

  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map((item) =>
          deleteContact({
            id: book_id,
            vCardId: item.id,
            kind: item.kind,
          }).unwrap()
        )
      )
      setSelectedItems([])
      setBulkDeleteOpen(false)
    } catch {
      // RTK mutation handler shows toast; keep dialog open for retry
    }
  }

  const selectedIndividuals = selectedItems.filter(isIndividualContact)
  const canCreateList = writable && !allContactsView && selectedIndividuals.length >= 2
  const hasSelections = writable && !allContactsView && selectedItems.length > 0
  const showCheckboxes = hasSelections

  const handleCreateListFromSelection = () => {
    dispatch(
      openCreateListForm({
        bookId: book_id,
        members: membersFromContacts(selectedIndividuals),
      })
    )
    setSelectedItems([])
  }

  return (
    <>
      <div className="flex w-full flex-col rounded p-4">
        {(hasSummaryCounts || hasSelections || isFetching) && (
        <div className="text-muted-foreground flex min-w-0 flex-row items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {isFetching && (
              <Loader2
                className="text-muted-foreground h-4 w-4 shrink-0 animate-spin"
                aria-hidden
              />
            )}
            {hasSelections ? (
              <>
                <span className="text-sm font-medium">
                  {t('selected_count.string', {
                    number: selectedItems.length,
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleDeselectAll}
                  aria-label={t('deselect_all.string')}
                >
                  <X className="h-4 w-4" />
                </Button>
                {canCreateList && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCreateListFromSelection}
                    aria-label={t('create_list_from_selection.string')}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-6 w-6"
                  onClick={() => setBulkDeleteOpen(true)}
                  disabled={isDeleting}
                  aria-label={t('delete_selected.string')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : hasSummaryCounts ? (
              <EntriesSummary
                listCount={summaryListCount}
                contactCount={summaryContactCount}
              />
            ) : null}
          </div>
          <div className="bg-muted/50 flex shrink-0 items-center rounded-md border border-transparent">
            {serverSide && (
              <Select value={sortBy} onValueChange={handleSortByChange}>
                <SelectTrigger
                  className="text-muted-foreground h-7 w-auto max-w-[9rem] gap-1 border-0 bg-transparent px-2 text-xs shadow-none"
                  aria-label={t('filters.sort_by.string')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {SORT_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {t(`filters.sort_options.${field}.string`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 gap-1 rounded-l-none px-2 text-xs"
              onClick={handleToggleSort}
              aria-label={
                sortOrder === 'asc'
                  ? t('filters.sort_order_asc.string')
                  : t('filters.sort_order_desc.string')
              }
            >
              {sortOrder === 'asc' ? (
                <ArrowDownAZ className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpAZ className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        )}

        <div className={cn('flex min-h-0 flex-1 flex-col space-y-5', (hasSummaryCounts || hasSelections || isFetching) && 'mt-4')}>
          {searchTooShort && (
            <p className="text-muted-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center text-sm">
              {t('search_min_length.string')}
            </p>
          )}

          {totalDisplayed === 0 && isSearchActive && !searchTooShort && (
            <AddressBookEmptyState
              variant="search"
              onClearSearch={() => dispatch(setSearchQuery(''))}
            />
          )}

          {totalDisplayed === 0 && !isSearchActive && isBookEmpty && (
            <AddressBookEmptyState
              variant="empty"
              bookId={book_id}
              showCreateAction={canCreateFromEmpty}
            />
          )}

          {totalDisplayed === 0 && !isSearchActive && !isBookEmpty && (
            <p className="text-muted-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center text-sm">
              {t('no_items.string')}
            </p>
          )}

          <ListSection
            variant="lists"
            title={t('sections.distribution_lists.string')}
            items={allContactsView ? [] : distributionLists}
            bookId={book_id}
            contactId={contact_id}
            selectedItems={selectedItems}
            showCheckboxes={showCheckboxes}
            onHandleCheckboxClick={handleCheckboxClick}
            sourceBookNamesById={sourceBookNamesById}
          />

          <ListSection
            variant="contacts"
            title={t('sections.contacts.string')}
            items={contacts}
            bookId={book_id}
            contactId={contact_id}
            selectedItems={selectedItems}
            showCheckboxes={showCheckboxes}
            onHandleCheckboxClick={handleCheckboxClick}
            allContactsView={allContactsView}
            sourceBookNamesById={sourceBookNamesById}
            className={distributionLists.length > 0 ? 'border-t pt-4' : undefined}
          />
        </div>

        {showPagination && (
          <AddressBookListPagination
            totalPages={totalPages}
            currentPage={currentPage}
            showPageSize={serverSide}
          />
        )}
      </div>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tForm('delete_dialog.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('bulk_delete_description.string', {
                number: selectedItems.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tForm('cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isDeleting}
            >
              {tForm('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(AddressBookList)
