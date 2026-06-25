'use client'

import { Button } from '@/components/ui/button'
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
import { useActiveAddressBookWritable } from '../../hooks/use-active-address-book'
import { useDeleteVCardFromAddressBookMutation } from '../../store/address-books-api'
import ExportEntryDialog from '../sidebar/actions/export-entry-dialog'
import { openEditForm } from '../../store/address-books-ui-slice'

type ContactActionsProps = {
  contactId: string
  bookId: string
  emails?: string[]
  displayName?: string
}

function ContactActions({
  contactId,
  bookId,
  emails = [],
  displayName,
}: ContactActionsProps) {
  const t = useTranslations('CONTACT_FORM')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const { writable } = useActiveAddressBookWritable()
  const [deleteContact] = useDeleteVCardFromAddressBookMutation()

  const validEmails = emails.filter(Boolean)

  const handleEdit = () => {
    dispatch(openEditForm({ contactId, bookId }))
  }

  const handleWriteMessage = () => {
    if (!validEmails.length) return

    dispatch(
      createDraft({
        id: `compose-${Date.now()}`,
        initialData: {
          to: validEmails.map((email) => ({
            email,
            name: displayName,
          })),
        },
      })
    )
  }

  const handleConfirmDelete = async () => {
    await deleteContact({ id: bookId, vCardId: contactId }).unwrap()
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
          disabled={validEmails.length === 0}
          data-testid="write-to-contact-button"
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
              aria-label={t('actions_menu.string')}
              data-testid="contact-actions-menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem
              onClick={() => setExportOpen(true)}
              data-testid="export-contact-button"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('export.string')}
            </DropdownMenuItem>
            {writable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleEdit}
                  data-testid="edit-contact-button"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('edit.string')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                  data-testid="delete-contact-button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete.string')}
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
        entryId={contactId}
        entryLabel={displayName || contactId}
        kind="contact"
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
            <AlertDialogCancel>{t('cancel.string')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t('delete_dialog.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(ContactActions)
