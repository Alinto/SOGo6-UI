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
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { ArrowDownAZ, ArrowUpAZ, ListFilter, Trash2, Users, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { VCard } from '../address-books-types'
import { useDeleteVCardFromAddressBookMutation } from '../store/address-books-api'
import {
  openCreateListForm,
  selectAddressBooksUi,
  setSearchQuery,
  toggleSortOrder,
} from '../store/address-books-ui-slice'
import AddressBookEmptyState from './address-book-empty-state'
import { partitionAddressBookEntries } from '../utils/contact-list'
import {
  isIndividualContact,
  membersFromContacts,
} from '../utils/distribution-list'
import ListSection from './list-section'
import AddressBookListSkeleton from './skeletons/skeleton'

interface AddressBookListProps {
  items: VCard[]
  isLoading: boolean
}

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

const AddressBookList: React.FC<AddressBookListProps> = ({
  items,
  isLoading,
}) => {
  const t = useTranslations('ADDRESS_BOOKS_LIST')
  const tForm = useTranslations('CONTACT_FORM')
  const params = useParams()
  const dispatch = useAppDispatch()
  const contact_id = params?.contact_id as string | undefined
  const book_id = params?.book_id as string

  const { searchQuery, sortOrder } = useAppSelector(selectAddressBooksUi)
  const [deleteContact] = useDeleteVCardFromAddressBookMutation()

  const [selectedItems, setSelectedItems] = React.useState<VCard[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const { distributionLists, contacts } = useMemo(
    () => partitionAddressBookEntries(items, searchQuery, sortOrder),
    [items, searchQuery, sortOrder]
  )

  const totalDisplayed = distributionLists.length + contacts.length
  const isSearchActive = searchQuery.trim().length > 0
  const isBookEmpty = items.length === 0

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

  const handleConfirmBulkDelete = async () => {
    await Promise.all(
      selectedItems.map((item) =>
        deleteContact({ id: book_id, vCardId: item.id }).unwrap()
      )
    )
    setSelectedItems([])
    setBulkDeleteOpen(false)
  }

  const selectedIndividuals = selectedItems.filter(isIndividualContact)
  const canCreateList = selectedIndividuals.length >= 2
  const hasSelections = selectedItems.length > 0
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

  if (isLoading) {
    return <AddressBookListSkeleton />
  }

  return (
    <>
      <div className="flex w-full flex-col rounded p-4">
        <div className="text-muted-foreground flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
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
                  aria-label={t('delete_selected.string')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <EntriesSummary
                listCount={distributionLists.length}
                contactCount={contacts.length}
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 gap-1 px-2 text-xs"
            onClick={handleToggleSort}
            aria-label={t('filters.name.string')}
          >
            <ListFilter className="h-4 w-4" />
            <span>{t('filters.name.string')}</span>
            {sortOrder === 'asc' ? (
              <ArrowDownAZ className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpAZ className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="mt-4 space-y-5">
          {totalDisplayed === 0 && isSearchActive && (
            <AddressBookEmptyState
              variant="search"
              onClearSearch={() => dispatch(setSearchQuery(''))}
            />
          )}

          {totalDisplayed === 0 && !isSearchActive && isBookEmpty && (
            <AddressBookEmptyState variant="empty" bookId={book_id} />
          )}

          {totalDisplayed === 0 && !isSearchActive && !isBookEmpty && (
            <p className="text-muted-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center text-sm">
              {t('no_items.string')}
            </p>
          )}

          <ListSection
            variant="lists"
            title={t('sections.distribution_lists.string')}
            items={distributionLists}
            bookId={book_id}
            contactId={contact_id}
            selectedItems={selectedItems}
            showCheckboxes={showCheckboxes}
            onHandleCheckboxClick={handleCheckboxClick}
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
            className={distributionLists.length > 0 ? 'border-t pt-4' : undefined}
          />
        </div>
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
            <AlertDialogCancel>{tForm('cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete}>
              {tForm('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AddressBookList
