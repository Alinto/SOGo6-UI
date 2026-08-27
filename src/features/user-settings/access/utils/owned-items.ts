import type { AddressBook, AddressBooks } from '@/features/address_books/address-books-types'
import type { Calendar } from '@/features/calendars/calendars-types'
import { isPersonalCalendar } from '@/features/calendars/utils/calendar-source-type'
import type { ImapFolder } from '@/features/mails/mails-types'
import { isVirtualFolder } from '@/features/mails/utils/folder-type-helpers'

/** Flattens the mail folder tree into a single list — every folder belongs to the account, so all are shareable. */
export function flattenMailFolders(folders: ImapFolder[]): ImapFolder[] {
  const result: ImapFolder[] = []
  for (const folder of folders) {
    if (!isVirtualFolder(folder)) {
      result.push(folder)
    }
    const children = folder.subfolders ?? folder.children ?? []
    if (children.length > 0) {
      result.push(...flattenMailFolders(children))
    }
  }
  return result
}

/** Only calendars the current user owns can have their ACLs managed. */
export function filterOwnedCalendars(calendars: Calendar[]): Calendar[] {
  return calendars.filter((calendar) => isPersonalCalendar(calendar))
}

/** Only personal address books can have their ACLs managed. */
export function filterOwnedAddressBooks(addressBooks: AddressBooks): AddressBook[] {
  return addressBooks.personals
}
