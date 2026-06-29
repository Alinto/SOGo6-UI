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
import { Download, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { memo, type ReactNode } from 'react'
import ExportEntryDialog from '../sidebar/actions/export-entry-dialog'
import type { ContactKind } from '../../address-books-types'

type EntryActionsShellProps = {
  writeMessageLabel: string
  writeMessageDisabled: boolean
  onWriteMessage: () => void
  writeMessageTestId: string
  actionsMenuLabel: string
  actionsMenuTestId: string
  exportLabel: string
  exportTestId: string
  onExportOpen: () => void
  writable: boolean
  editLabel: string
  editTestId: string
  onEdit: () => void
  deleteLabel: string
  deleteTestId: string
  onDeleteOpen: () => void
  exportOpen: boolean
  onExportOpenChange: (open: boolean) => void
  bookId: string
  entryId: string
  entryLabel: string
  exportKind: ContactKind
  deleteOpen: boolean
  onDeleteOpenChange: (open: boolean) => void
  deleteDialogTitle: string
  deleteDialogDescription: string
  cancelLabel: string
  deleteConfirmLabel: string
  onConfirmDelete: () => void | Promise<void>
  isDeleting: boolean
  extraMenuItems?: ReactNode
}

function EntryActionsShell({
  writeMessageLabel,
  writeMessageDisabled,
  onWriteMessage,
  writeMessageTestId,
  actionsMenuLabel,
  actionsMenuTestId,
  exportLabel,
  exportTestId,
  onExportOpen,
  writable,
  editLabel,
  editTestId,
  onEdit,
  deleteLabel,
  deleteTestId,
  onDeleteOpen,
  exportOpen,
  onExportOpenChange,
  bookId,
  entryId,
  entryLabel,
  exportKind,
  deleteOpen,
  onDeleteOpenChange,
  deleteDialogTitle,
  deleteDialogDescription,
  cancelLabel,
  deleteConfirmLabel,
  onConfirmDelete,
  isDeleting,
  extraMenuItems,
}: EntryActionsShellProps) {
  return (
    <>
      <div className="flex min-w-0 shrink items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="max-w-full"
          onClick={onWriteMessage}
          disabled={writeMessageDisabled}
          data-testid={writeMessageTestId}
        >
          <Mail className="h-4 w-4 shrink-0 sm:mr-1" />
          <span className="hidden sm:inline">{writeMessageLabel}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={actionsMenuLabel}
              data-testid={actionsMenuTestId}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem onClick={onExportOpen} data-testid={exportTestId}>
              <Download className="mr-2 h-4 w-4" />
              {exportLabel}
            </DropdownMenuItem>
            {extraMenuItems}
            {writable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit} data-testid={editTestId}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {editLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onDeleteOpen}
                  data-testid={deleteTestId}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteLabel}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ExportEntryDialog
        open={exportOpen}
        onOpenChange={onExportOpenChange}
        bookId={bookId}
        entryId={entryId}
        entryLabel={entryLabel}
        kind={exportKind}
      />

      <AlertDialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {deleteConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(EntryActionsShell)
