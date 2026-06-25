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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createDraft } from '@/features/mails/store'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Download, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import type { VCard } from '../../address-books-types'
import { useActiveAddressBookWritable } from '../../hooks/use-active-address-book'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import { openEditListForm } from '../../store/address-books-ui-slice'
import { getDistributionListEmails, getDistributionListName } from '../../utils/distribution-list'
import ExportEntryDialog from '../sidebar/actions/export-entry-dialog'

type DistributionListActionsProps = {
  list: VCard
  bookId: string
}

function DistributionListActions({ list, bookId }: DistributionListActionsProps) {
  const t = useTranslations('DISTRIBUTION_LIST_FORM')
  const tContact = useTranslations('CONTACT_FORM')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const { writable } = useActiveAddressBookWritable()
  const [deleteList] = useDeleteVCardFromAddressBookMutation()

  const listName = getDistributionListName(list)

  const handleEdit = () => {
    dispatch(openEditListForm({ listId: list.id, bookId }))
  }

  const handleWriteMessage = () => {
    const emails = getDistributionListEmails(list)
    if (!emails.length) return

    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: emails.map((email) => {
            const member = list.members?.find((item) => item.email === email)
            return {
              email,
              name: member?.displayName,
            }
          }),
        },
      })
    )
  }

  const handleConfirmDelete = async () => {
    await deleteList({ id: bookId, vCardId: list.id, kind: 'group' }).unwrap()
    setDeleteOpen(false)
    push(`/address_books/${bookId}`)
  }

  return (
    <>
      <div className="flex min-w-0 shrink items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="max-w-full"
          onClick={handleWriteMessage}
          disabled={getDistributionListEmails(list).length === 0}
          data-testid="write-to-list-button"
        >
          <Mail className="h-4 w-4 shrink-0 sm:mr-1" />
          <span className="hidden sm:inline">{t('write_message.string')}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={tContact('actions_menu.string')}
              data-testid="list-actions-menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem
              onClick={() => setExportOpen(true)}
              data-testid="export-list-button"
            >
              <Download className="mr-2 h-4 w-4" />
              {tContact('export.string')}
            </DropdownMenuItem>
            {writable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleEdit}
                  data-testid="edit-list-button"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {tContact('edit.string')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  data-testid="delete-list-button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {tContact('delete.string')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ExportEntryDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        bookId={bookId}
        entryId={list.id}
        entryLabel={listName}
        kind="group"
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_dialog.title.string')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_dialog.description.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tContact('cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(DistributionListActions)
