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
import { Dialog, DialogContent } from '@/components/ui/dialog'
import ShareAddressBookAction from '@/features/address_books/components/sidebar/actions/share'
import { useSetAddressBookShareMutation } from '@/features/address_books/store/address-books-api'
import ShareCalendarAction from '@/features/calendars/components/sidebar/actions/share'
import { useSetCalendarShareMutation } from '@/features/calendars/store/calendars-api'
import { ShareFolderDialog } from '@/features/mails/components/sidebars/share-folder-dialog'
import { useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import { Calendar, Contact, Mail, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { GlobalAccessGrant } from '../store/access-api'
import {
  addressBookGrantSummary,
  calendarGrantSummary,
  mailGrantSummary,
} from '../utils/grant-summary'

const DOMAIN_ICON = { mail: Mail, calendar: Calendar, contact: Contact }

interface GlobalAccessGrantRowProps {
  grant: GlobalAccessGrant
}

const GlobalAccessGrantRow: React.FC<GlobalAccessGrantRowProps> = ({
  grant,
}) => {
  const t = useTranslations('US_ACCESS')
  const mailT = useTranslations('MAILS_COMMONS')
  const calendarT = useTranslations('CALENDARS')
  const addressBookT = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const [changeOpen, setChangeOpen] = React.useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const [setFolderShare] = useSetFolderShareMutation()
  const [setCalendarShare] = useSetCalendarShareMutation()
  const [setAddressBookShare] = useSetAddressBookShareMutation()

  const DomainIcon = DOMAIN_ICON[grant.domain]

  const summary =
    grant.domain === 'mail'
      ? mailGrantSummary(grant.rights, mailT)
      : grant.domain === 'calendar'
        ? calendarGrantSummary(grant.rights, calendarT)
        : addressBookGrantSummary(grant.rights, addressBookT)

  const handleRemove = async (): Promise<void> => {
    setIsRemoving(true)
    try {
      if (grant.domain === 'mail') {
        const remainingUsers = grant.allItemUsers.filter(
          (u) => u.uid !== grant.uid
        )
        await setFolderShare({
          accountId,
          folderPath: grant.itemKey,
          users: remainingUsers,
        }).unwrap()
      } else if (grant.domain === 'calendar') {
        const remainingUsers = grant.allItemUsers.filter(
          (u) => u.uid !== grant.uid
        )
        await setCalendarShare({
          calendarKey: grant.itemKey,
          users: remainingUsers,
        }).unwrap()
      } else {
        const remainingUsers = grant.allItemUsers.filter(
          (u) => u.uid !== grant.uid
        )
        await setAddressBookShare({
          bookId: grant.itemKey,
          users: remainingUsers,
        }).unwrap()
      }
      setConfirmRemoveOpen(false)
    } catch {
      // Error surfaced by the mutation's own notification handler.
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <DomainIcon className="text-muted-foreground h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{grant.itemName}</p>
          {summary && (
            <p className="text-muted-foreground truncate text-xs">
              {summary}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setChangeOpen(true)}
        >
          {t('grant.change.string')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-8 w-8"
          onClick={() => setConfirmRemoveOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('grant.remove.string')}</span>
        </Button>
      </div>

      {grant.domain === 'mail' ? (
        <ShareFolderDialog
          open={changeOpen}
          onOpenChange={setChangeOpen}
          accountId={accountId}
          folderPath={grant.itemKey}
          folderName={grant.itemName}
          allowAddUsers={false}
        />
      ) : (
        <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
          <DialogContent
            className={
              grant.domain === 'calendar'
                ? 'max-w-[calc(100vw-2rem)] sm:max-w-2xl'
                : undefined
            }
          >
            {grant.domain === 'calendar' && (
              <ShareCalendarAction
                id={grant.itemKey}
                calendarKey={grant.itemKey}
                name={grant.itemName}
                onClose={() => setChangeOpen(false)}
                allowAddUsers={false}
              />
            )}
            {grant.domain === 'contact' && (
              <ShareAddressBookAction
                id={grant.itemKey}
                name={grant.itemName}
                onClose={() => setChangeOpen(false)}
                allowAddUsers={false}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('grant.removeConfirm.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('grant.removeConfirm.description.string', {
                item: grant.itemName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              {t('grant.removeConfirm.cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleRemove()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
            >
              {t('grant.removeConfirm.confirm.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default GlobalAccessGrantRow
