import type {
  AddressBookShareRights,
  AddressBookShareUser,
} from '@/features/address_books/address-books-types'
import { addressBooksApiEndpoints } from '@/features/address_books/store/address-books-api'
import type {
  CalendarShareRights,
  CalendarShareUser,
} from '@/features/calendars/calendars-types'
import { calendarsApiEndpoints } from '@/features/calendars/store/calendars-api'
import { ANY_AUTHENTICATED_UID as CALENDAR_ANY_AUTHENTICATED_UID } from '@/features/calendars/utils/calendar-permission-mapping'
import type { FolderShareRights, FolderShareUser } from '@/features/mails/mails-types'
import { mailsApiEndpoints } from '@/features/mails/store/mails-api'
import { ANY_AUTHENTICATED_UID as MAIL_ANY_AUTHENTICATED_UID } from '@/features/mails/utils/permission-mapping'
import { ANY_AUTHENTICATED_UID as ADDRESS_BOOK_ANY_AUTHENTICATED_UID } from '@/features/address_books/utils/address-book-permission-mapping'
import {
  ADDRESS_BOOK_SHARE_SLICE,
  apiSlice,
  CALENDAR_SHARE_SLICE,
  FOLDER_SHARE_SLICE,
} from '@/lib/redux/api/api-slice'
import type { BaseQueryApi, BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import {
  filterOwnedAddressBooks,
  filterOwnedCalendars,
  flattenMailFolders,
} from '../utils/owned-items'

const MAIN_ACCOUNT_ID = '0'

interface BaseGrant {
  itemName: string
  uid: string
  c_email?: string
}

export interface MailAccessGrant extends BaseGrant {
  domain: 'mail'
  itemKey: string
  rights: FolderShareRights
  allItemUsers: FolderShareUser[]
}

export interface CalendarAccessGrant extends BaseGrant {
  domain: 'calendar'
  itemKey: string
  rights: CalendarShareRights
  allItemUsers: CalendarShareUser[]
}

export interface AddressBookAccessGrant extends BaseGrant {
  domain: 'contact'
  itemKey: string
  rights: AddressBookShareRights
  allItemUsers: AddressBookShareUser[]
}

export type GlobalAccessGrant =
  | MailAccessGrant
  | CalendarAccessGrant
  | AddressBookAccessGrant

export interface GlobalAccessUserEntry {
  /** Merge key across domains: lowercased email when available, else uid. */
  key: string
  uid: string
  c_email?: string
  grants: GlobalAccessGrant[]
}

function mergeKey(uid: string, c_email?: string): string {
  return (c_email ?? uid).toLowerCase()
}

async function collectMailGrants(
  dispatch: BaseQueryApi['dispatch']
): Promise<MailAccessGrant[]> {
  const folders = await dispatch(
    mailsApiEndpoints.endpoints.getFolders.initiate(
      { accountId: MAIN_ACCOUNT_ID },
      { subscribe: false }
    )
  ).unwrap()

  const owned = flattenMailFolders(folders)
  const grants: MailAccessGrant[] = []

  await Promise.all(
    owned.map(async (folder) => {
      try {
        const shareData = await dispatch(
          mailsApiEndpoints.endpoints.getFolderShare.initiate(
            { accountId: MAIN_ACCOUNT_ID, folderPath: folder.path },
            { subscribe: false }
          )
        ).unwrap()

        const allItemUsers = Object.values(shareData.users)
        for (const u of allItemUsers) {
          if (u.uid === MAIL_ANY_AUTHENTICATED_UID) continue
          grants.push({
            domain: 'mail',
            itemKey: folder.path,
            itemName: folder.name,
            uid: u.uid,
            c_email: u.c_email,
            rights: u.rights,
            allItemUsers,
          })
        }
      } catch {
        // Skip folders whose share data couldn't be fetched — don't fail the whole aggregate.
      }
    })
  )

  return grants
}

async function collectCalendarGrants(
  dispatch: BaseQueryApi['dispatch']
): Promise<CalendarAccessGrant[]> {
  const calendars = await dispatch(
    calendarsApiEndpoints.endpoints.getCalendars.initiate(undefined, {
      subscribe: false,
    })
  ).unwrap()

  const owned = filterOwnedCalendars(calendars)
  const grants: CalendarAccessGrant[] = []

  await Promise.all(
    owned.map(async (calendar) => {
      const calendarKey = calendar.key ?? calendar.id ?? ''
      if (!calendarKey) return
      try {
        const shareData = await dispatch(
          calendarsApiEndpoints.endpoints.getCalendarShare.initiate(
            { calendarKey },
            { subscribe: false }
          )
        ).unwrap()

        const allItemUsers = Object.values(shareData.users)
        for (const u of allItemUsers) {
          if (u.uid === CALENDAR_ANY_AUTHENTICATED_UID) continue
          grants.push({
            domain: 'calendar',
            itemKey: calendarKey,
            itemName: calendar.name,
            uid: u.uid,
            c_email: u.c_email,
            rights: u.rights,
            allItemUsers,
          })
        }
      } catch {
        // Skip calendars whose share data couldn't be fetched — don't fail the whole aggregate.
      }
    })
  )

  return grants
}

async function collectAddressBookGrants(
  dispatch: BaseQueryApi['dispatch']
): Promise<AddressBookAccessGrant[]> {
  const addressBooks = await dispatch(
    addressBooksApiEndpoints.endpoints.getAddressBooks.initiate(undefined, {
      subscribe: false,
    })
  ).unwrap()

  const owned = filterOwnedAddressBooks(addressBooks)
  const grants: AddressBookAccessGrant[] = []

  await Promise.all(
    owned.map(async (book) => {
      try {
        const shareData = await dispatch(
          addressBooksApiEndpoints.endpoints.getAddressBookShare.initiate(
            { bookId: book.id },
            { subscribe: false }
          )
        ).unwrap()

        const allItemUsers = Object.values(shareData.users)
        for (const u of allItemUsers) {
          if (u.uid === ADDRESS_BOOK_ANY_AUTHENTICATED_UID) continue
          grants.push({
            domain: 'contact',
            itemKey: book.id,
            itemName: book.name,
            uid: u.uid,
            c_email: u.c_email,
            rights: u.rights,
            allItemUsers,
          })
        }
      } catch {
        // Skip address books whose share data couldn't be fetched — don't fail the whole aggregate.
      }
    })
  )

  return grants
}

export function pivotGrantsByUser(
  grants: GlobalAccessGrant[]
): GlobalAccessUserEntry[] {
  const byKey = new Map<string, GlobalAccessUserEntry>()

  for (const grant of grants) {
    const key = mergeKey(grant.uid, grant.c_email)
    const existing = byKey.get(key)
    if (existing) {
      existing.grants.push(grant)
      existing.c_email = existing.c_email ?? grant.c_email
    } else {
      byKey.set(key, {
        key,
        uid: grant.uid,
        c_email: grant.c_email,
        grants: [grant],
      })
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    (a.c_email ?? a.uid).localeCompare(b.c_email ?? b.uid)
  )
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getGlobalAccess: builder.query<GlobalAccessUserEntry[], void>({
      queryFn: async (_arg, api) => {
        const { dispatch } = api

        const [mailGrants, calendarGrants, addressBookGrants] =
          await Promise.all([
            collectMailGrants(dispatch),
            collectCalendarGrants(dispatch),
            collectAddressBookGrants(dispatch),
          ])

        return {
          data: pivotGrantsByUser([
            ...mailGrants,
            ...calendarGrants,
            ...addressBookGrants,
          ]),
        }
      },
      providesTags: [
        FOLDER_SHARE_SLICE,
        CALENDAR_SHARE_SLICE,
        ADDRESS_BOOK_SHARE_SLICE,
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useGetGlobalAccessQuery } = injectedEndpoints

export const globalAccessApiEndpoints = injectedEndpoints
