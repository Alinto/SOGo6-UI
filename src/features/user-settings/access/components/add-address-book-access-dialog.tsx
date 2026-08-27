'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  useGetAddressBooksQuery,
  useLazyGetAddressBookShareQuery,
  useSetAddressBookShareMutation,
} from '@/features/address_books/store/address-books-api'
import type { AddressBookShareUser } from '@/features/address_books/address-books-types'
import {
  ADDRESS_BOOK_PERMISSIONS,
  applyAddressBookPermissionToggle,
  defaultAddressBookShareRights,
  isAddressBookViewForced,
} from '@/features/address_books/utils/address-book-permission-mapping'
import { filterOwnedAddressBooks } from '@/features/user-settings/access/utils/owned-items'
import { Contact2, Loader2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { GlobalAccessUserEntry } from '../store/access-api'

interface AddAddressBookAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: GlobalAccessUserEntry
}

const AddAddressBookAccessDialog: React.FC<AddAddressBookAccessDialogProps> = ({
  open,
  onOpenChange,
  entry,
}) => {
  const t = useTranslations('US_ACCESS')
  const addressBookT = useTranslations('ADDRESS_BOOKS_SIDEBAR')

  const { data: addressBooks, isLoading } = useGetAddressBooksQuery(undefined, {
    skip: !open,
  })
  const [setAddressBookShare] = useSetAddressBookShareMutation()
  const [fetchAddressBookShare] = useLazyGetAddressBookShareQuery()

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [rights, setRights] = React.useState(defaultAddressBookShareRights())
  const [isSaving, setIsSaving] = React.useState(false)

  const sharedIds = React.useMemo(
    () =>
      new Set(
        entry.grants
          .filter((grant) => grant.domain === 'contact')
          .map((grant) => grant.itemKey)
      ),
    [entry.grants]
  )

  const allAddressBooks = React.useMemo(
    () => filterOwnedAddressBooks(addressBooks ?? { globals: [], personals: [], subscriptions: [] }),
    [addressBooks]
  )
  const available = React.useMemo(
    () => allAddressBooks.filter((book) => !sharedIds.has(book.id)),
    [allAddressBooks, sharedIds]
  )
  const viewForced = isAddressBookViewForced(rights)

  React.useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setRights(defaultAddressBookShareRights())
      setIsSaving(false)
    }
  }, [open])

  const toggleBook = (id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async (): Promise<void> => {
    if (selectedIds.size === 0) return

    setIsSaving(true)
    try {
      const newUser: AddressBookShareUser = {
        uid: entry.uid,
        c_email: entry.c_email,
        userClass: 'normal-user',
        rights,
        subscribed: false,
      }

      await Promise.all(
        Array.from(selectedIds).map(async (bookId) => {
          const shareData = await fetchAddressBookShare({ bookId }).unwrap()
          const existing = Object.values(shareData.users).filter(
            (u) => u.uid !== entry.uid
          )
          await setAddressBookShare({
            bookId,
            users: [...existing, newUser],
          }).unwrap()
        })
      )
      onOpenChange(false)
    } catch {
      // Error surfaced by each mutation's own notification handler.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-125 max-h-[90vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Contact2 className="h-4 w-4 shrink-0" />
            {t('addAccess.contact.title.string')}
          </DialogTitle>
          <DialogDescription>
            {t('addAccess.contact.description.string', {
              user: entry.c_email ?? entry.uid,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0 space-y-2">
            <p className="text-sm font-medium">{t('addAccess.itemsLabel.string')}</p>
            <ScrollArea className="h-40 rounded-md border p-2">
              {isLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
                </div>
              ) : available.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <Users className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {t(
                      allAddressBooks.length === 0
                        ? 'addAccess.noItems.string'
                        : 'addAccess.allShared.string'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {available.map((book) => (
                    <label
                      key={book.id}
                      className="flex items-center gap-2.5 rounded px-1 py-1.5 text-sm"
                    >
                      <Checkbox
                        checked={selectedIds.has(book.id)}
                        onCheckedChange={() => toggleBook(book.id)}
                      />
                      <span className="truncate">{book.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {ADDRESS_BOOK_PERMISSIONS.map((def) => {
              const forced = def.key === 'can_view' && viewForced
              const checked = forced || rights[def.key]

              return (
                <label
                  key={def.key}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    disabled={forced}
                    onCheckedChange={(c) =>
                      setRights((prev) =>
                        applyAddressBookPermissionToggle(prev, def.key, c === true)
                      )
                    }
                  />
                  {addressBookT(def.labelKey)}
                </label>
              )
            })}
          </div>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('addAccess.cancel.string')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || selectedIds.size === 0}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('addAccess.confirm.string')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressBookAccessDialog
