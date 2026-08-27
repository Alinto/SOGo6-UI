import type { CalendarShareLevel, CalendarShareRights } from '../calendars-types'

/**
 * Sentinel `uid` for the "any authenticated user" pseudo-entry in a
 * calendar's share list — not a real account, just a marker the UI/API
 * layers use to recognize it (e.g. to always sort/display this row last).
 */
export const ANY_AUTHENTICATED_UID = 'anyauthenticated'

export interface CalendarClassificationDef {
  key: 'public' | 'confidential' | 'private'
  labelKey: string
}

/** Iteration order for the 3 classification rows in the sharing UI. */
export const CALENDAR_CLASSIFICATIONS: CalendarClassificationDef[] = [
  {
    key: 'public',
    labelKey: 'sidebar.sharing.classifications.public.label.string',
  },
  {
    key: 'confidential',
    labelKey: 'sidebar.sharing.classifications.confidential.label.string',
  },
  {
    key: 'private',
    labelKey: 'sidebar.sharing.classifications.private.label.string',
  },
]

export interface CalendarShareLevelDef {
  value: CalendarShareLevel
  labelKey: string
}

/** Ordered options for each classification's Select, none -> most permissive. */
export const CALENDAR_SHARE_LEVELS: CalendarShareLevelDef[] = [
  { value: 'none', labelKey: 'sidebar.sharing.levels.none.label.string' },
  {
    value: 'view-date-time',
    labelKey: 'sidebar.sharing.levels.viewDateTime.label.string',
  },
  { value: 'view-all', labelKey: 'sidebar.sharing.levels.viewAll.label.string' },
  { value: 'respond-to', labelKey: 'sidebar.sharing.levels.respond.label.string' },
  { value: 'modify', labelKey: 'sidebar.sharing.levels.modify.label.string' },
]

export function defaultCalendarShareRights(): CalendarShareRights {
  return {
    public: 'none',
    confidential: 'none',
    private: 'none',
    can_create_objects: false,
    can_erase_objects: false,
  }
}

/** Whether at least one right is actually granted (vs. a placeholder entry with everything left at 'none'/off). */
export function hasAnyCalendarRight(rights: CalendarShareRights): boolean {
  return (
    rights.public !== 'none' ||
    rights.confidential !== 'none' ||
    rights.private !== 'none' ||
    rights.can_create_objects ||
    rights.can_erase_objects
  )
}
