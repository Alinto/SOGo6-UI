import type { AddressBookShareRights } from '@/features/address_books/address-books-types'
import { ADDRESS_BOOK_PERMISSIONS } from '@/features/address_books/utils/address-book-permission-mapping'
import type { CalendarShareLevel, CalendarShareRights } from '@/features/calendars/calendars-types'
import {
  CALENDAR_SHARE_LEVELS,
} from '@/features/calendars/utils/calendar-permission-mapping'
import type { FolderShareRights } from '@/features/mails/mails-types'
import {
  SIMPLIFIED_PERMISSIONS,
  computeSimplifiedStates,
} from '@/features/mails/utils/permission-mapping'

type Translator = (key: string) => string

/** Human-readable summary of a mail folder grant, e.g. "Read, Modify". */
export function mailGrantSummary(rights: FolderShareRights, t: Translator): string {
  const states = computeSimplifiedStates(rights)
  const active = SIMPLIFIED_PERMISSIONS.filter((def) => states[def.key])
  return active.map((def) => t(def.labelKey)).join(', ')
}

const CALENDAR_LEVEL_ORDER: CalendarShareLevel[] = [
  'none',
  'view-date-time',
  'view-all',
  'respond-to',
  'modify',
]

/** Highest classification level granted, e.g. "Modify". */
export function calendarGrantSummary(
  rights: CalendarShareRights,
  t: Translator
): string {
  const highest = [rights.public, rights.confidential, rights.private].reduce(
    (max, level) =>
      CALENDAR_LEVEL_ORDER.indexOf(level) > CALENDAR_LEVEL_ORDER.indexOf(max)
        ? level
        : max,
    'none' as CalendarShareLevel
  )
  const def = CALENDAR_SHARE_LEVELS.find((l) => l.value === highest)
  return def ? t(def.labelKey) : ''
}

/** Human-readable summary of an address book grant, e.g. "View, Create". */
export function addressBookGrantSummary(
  rights: AddressBookShareRights,
  t: Translator
): string {
  const active = ADDRESS_BOOK_PERMISSIONS.filter((def) => rights[def.key])
  return active.map((def) => t(def.labelKey)).join(', ')
}
