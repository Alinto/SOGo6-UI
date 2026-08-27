'use client'

import type { AddressBookShareUser } from '@/features/address_books/address-books-types'
import { useSetAddressBookShareMutation } from '@/features/address_books/store/address-books-api'
import type { CalendarShareUser } from '@/features/calendars/calendars-types'
import { useSetCalendarShareMutation } from '@/features/calendars/store/calendars-api'
import type { FolderShareUser } from '@/features/mails/mails-types'
import { useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import type { GlobalAccessGrant } from '../store/access-api'

/** Mutations that act on a single grant, shared by the user-row bulk actions (copy access, remove all access). */
export function useGlobalAccessGrantMutations() {
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const [setFolderShare] = useSetFolderShareMutation()
  const [setCalendarShare] = useSetCalendarShareMutation()
  const [setAddressBookShare] = useSetAddressBookShareMutation()

  async function removeUserFromGrant(
    grant: GlobalAccessGrant,
    uid: string
  ): Promise<void> {
    if (grant.domain === 'mail') {
      const users = grant.allItemUsers.filter((u) => u.uid !== uid)
      await setFolderShare({ accountId, folderPath: grant.itemKey, users }).unwrap()
    } else if (grant.domain === 'calendar') {
      const users = grant.allItemUsers.filter((u) => u.uid !== uid)
      await setCalendarShare({ calendarKey: grant.itemKey, users }).unwrap()
    } else {
      const users = grant.allItemUsers.filter((u) => u.uid !== uid)
      await setAddressBookShare({ bookId: grant.itemKey, users }).unwrap()
    }
  }

  /** Grants `targetEmail` the same rights as this grant's user on the same item, replacing any rights they already had there. */
  async function copyGrantToUser(
    grant: GlobalAccessGrant,
    targetEmail: string
  ): Promise<void> {
    const trimmed = targetEmail.trim()
    const isTarget = (u: { uid: string; c_email?: string }): boolean =>
      u.uid.toLowerCase() === trimmed.toLowerCase() ||
      u.c_email?.toLowerCase() === trimmed.toLowerCase()

    if (grant.domain === 'mail') {
      const source = grant.allItemUsers.find((u) => u.uid === grant.uid)
      const newUser: FolderShareUser = {
        uid: trimmed,
        c_email: trimmed,
        userClass: 'normal-user',
        rights: grant.rights,
        permissions: source?.permissions,
        applyToSubfolders: source?.applyToSubfolders ?? false,
      }
      const users = grant.allItemUsers.filter((u) => !isTarget(u))
      await setFolderShare({
        accountId,
        folderPath: grant.itemKey,
        users: [...users, newUser],
      }).unwrap()
    } else if (grant.domain === 'calendar') {
      const newUser: CalendarShareUser = {
        uid: trimmed,
        c_email: trimmed,
        userClass: 'normal-user',
        rights: grant.rights,
      }
      const users = grant.allItemUsers.filter((u) => !isTarget(u))
      await setCalendarShare({
        calendarKey: grant.itemKey,
        users: [...users, newUser],
      }).unwrap()
    } else {
      const newUser: AddressBookShareUser = {
        uid: trimmed,
        c_email: trimmed,
        userClass: 'normal-user',
        rights: grant.rights,
        subscribed: false,
      }
      const users = grant.allItemUsers.filter((u) => !isTarget(u))
      await setAddressBookShare({
        bookId: grant.itemKey,
        users: [...users, newUser],
      }).unwrap()
    }
  }

  return { removeUserFromGrant, copyGrantToUser }
}
