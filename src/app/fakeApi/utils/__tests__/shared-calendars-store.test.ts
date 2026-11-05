import type { Calendar } from '@/features/calendars/calendars-types'
import type { NextRequest } from 'next/server'
import {
  SHARED_CALENDARS_CATALOG,
  SUBSCRIBED_STORAGE_KEY,
  getSubscribedKeys,
  getSubscribedSharedCalendars,
  isUnsubscribedSharedCalendar,
} from '../shared-calendars-store'

const requestWithKeys = (keys?: unknown): NextRequest =>
  ({
    cookies: {
      get: (name: string) =>
        name === SUBSCRIBED_STORAGE_KEY && keys !== undefined
          ? { value: JSON.stringify(keys) }
          : undefined,
    },
  }) as unknown as NextRequest

const stored = (id: string, name = id): Calendar => ({
  id,
  name,
  description: null,
  owner: 'someone@example.com',
})

const ids = (calendars: Calendar[]) => calendars.map((c) => c.id)

describe('shared-calendars-store', () => {
  it('only contains Team Lead and Administrator calendars', () => {
    expect(
      Array.from(new Set(SHARED_CALENDARS_CATALOG.map((c) => c.name_owner)))
    ).toEqual(['Team Lead', 'Administrator'])
  })

  it('subscribes to the default shared calendars without a cookie', () => {
    expect(getSubscribedKeys(requestWithKeys())).toEqual([
      'shared-cal-1',
      'shared-cal-2',
    ])
  })

  it('falls back to the defaults on an invalid cookie', () => {
    expect(getSubscribedKeys(requestWithKeys({ not: 'an array' }))).toEqual([
      'shared-cal-1',
      'shared-cal-2',
    ])
  })

  it('keeps the stored default shared calendars while subscribed', () => {
    const result = getSubscribedSharedCalendars(requestWithKeys(), [
      stored('shared-cal-1', 'Stored team'),
      stored('shared-cal-2', 'Stored company'),
    ])

    expect(ids(result)).toEqual(['shared-cal-1', 'shared-cal-2'])
    expect(result[0].name).toBe('Stored team')
  })

  it('adds a subscribed catalog calendar once, keyed by id', () => {
    const result = getSubscribedSharedCalendars(
      requestWithKeys(['shared-cal-1', 'shared-cal-3']),
      [stored('shared-cal-1')]
    )

    expect(ids(result)).toEqual(['shared-cal-1', 'shared-cal-3'])
    expect(result[1]).toMatchObject({
      id: 'shared-cal-3',
      key: 'shared-cal-3',
      owner: 'team-lead@example.com',
      subscribed: true,
    })
  })

  it('hides a stored shared calendar once unsubscribed', () => {
    const result = getSubscribedSharedCalendars(
      requestWithKeys(['shared-cal-2']),
      [stored('shared-cal-1'), stored('shared-cal-2')]
    )

    expect(ids(result)).toEqual(['shared-cal-2'])
  })

  it('keeps stored shared calendars that are not in the catalog', () => {
    const result = getSubscribedSharedCalendars(requestWithKeys([]), [
      stored('legacy-shared'),
    ])

    expect(ids(result)).toEqual(['legacy-shared'])
  })

  it('flags catalog calendars the user is not subscribed to', () => {
    const req = requestWithKeys(['shared-cal-2'])

    expect(isUnsubscribedSharedCalendar(req, 'shared-cal-1')).toBe(true)
    expect(isUnsubscribedSharedCalendar(req, 'shared-cal-2')).toBe(false)
    expect(isUnsubscribedSharedCalendar(req, 'personal')).toBe(false)
  })
})
