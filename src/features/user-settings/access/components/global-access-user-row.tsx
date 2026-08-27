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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, ChevronDown, Contact, Copy, Mail, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGlobalAccessGrantMutations } from '../hooks/use-global-access-mutations'
import type { GlobalAccessUserEntry } from '../store/access-api'
import AddAddressBookAccessDialog from './add-address-book-access-dialog'
import AddCalendarAccessDialog from './add-calendar-access-dialog'
import AddFolderAccessDialog from './add-folder-access-dialog'
import CopyAccessDialog from './copy-access-dialog'
import GlobalAccessGrantRow from './global-access-grant-row'

function getInitials(email?: string): string {
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}

type AddAccessDomain = 'mail' | 'calendar' | 'contact' | null

interface GlobalAccessUserRowProps {
  entry: GlobalAccessUserEntry
  /** Called instead of the delete mutations for a pending, grant-less entry (added via "Add" but never yet given access). */
  onRemovePending?: () => void
}

const GlobalAccessUserRow: React.FC<GlobalAccessUserRowProps> = ({
  entry,
  onRemovePending,
}) => {
  const t = useTranslations('US_ACCESS')
  const [expanded, setExpanded] = React.useState(false)
  const [addDomain, setAddDomain] = React.useState<AddAccessDomain>(null)
  const [copyOpen, setCopyOpen] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { removeUserFromGrant } = useGlobalAccessGrantMutations()
  const isPending = entry.grants.length === 0

  const toggleExpanded = (): void => setExpanded((prev) => !prev)

  const handleDeleteAll = async (): Promise<void> => {
    if (isPending) {
      onRemovePending?.()
      setConfirmDeleteOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      await Promise.all(
        entry.grants.map((grant) => removeUserFromGrant(grant, entry.uid))
      )
      setConfirmDeleteOpen(false)
    } catch {
      // Error surfaced by each mutation's own notification handler.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border-b last:border-b-0">
      <div className="flex w-full items-center gap-3 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={toggleExpanded}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(entry.c_email ?? entry.uid)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">
              {entry.c_email ?? entry.uid}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {entry.grants.length === 1
                ? t('user.grantCountOne.string')
                : t('user.grantCount.string', { count: entry.grants.length })}
            </p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t('user.actions.add.string')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setAddDomain('mail')}>
              <Mail className="h-4 w-4" />
              <span>{t('addAccess.menu.folder.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAddDomain('calendar')}>
              <Calendar className="h-4 w-4" />
              <span>{t('addAccess.menu.calendar.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAddDomain('contact')}>
              <Contact className="h-4 w-4" />
              <span>{t('addAccess.menu.contact.string')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isPending}
          onClick={() => setCopyOpen(true)}
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">{t('user.actions.copy.string')}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('user.actions.delete.string')}</span>
        </Button>
      </div>

      {expanded && (
        <div className="divide-y pb-3 pl-12">
          {entry.grants.map((grant) => (
            <GlobalAccessGrantRow
              key={`${grant.domain}-${grant.itemKey}`}
              grant={grant}
            />
          ))}
        </div>
      )}

      <AddFolderAccessDialog
        open={addDomain === 'mail'}
        onOpenChange={(open) => setAddDomain(open ? 'mail' : null)}
        entry={entry}
      />
      <AddCalendarAccessDialog
        open={addDomain === 'calendar'}
        onOpenChange={(open) => setAddDomain(open ? 'calendar' : null)}
        entry={entry}
      />
      <AddAddressBookAccessDialog
        open={addDomain === 'contact'}
        onOpenChange={(open) => setAddDomain(open ? 'contact' : null)}
        entry={entry}
      />

      <CopyAccessDialog open={copyOpen} onOpenChange={setCopyOpen} entry={entry} />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPending
                ? t('user.removePendingConfirm.title.string')
                : t('user.deleteConfirm.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPending
                ? t('user.removePendingConfirm.description.string', {
                    user: entry.c_email ?? entry.uid,
                  })
                : t('user.deleteConfirm.description.string', {
                    user: entry.c_email ?? entry.uid,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('user.deleteConfirm.cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDeleteAll()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {t('user.deleteConfirm.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default GlobalAccessUserRow
