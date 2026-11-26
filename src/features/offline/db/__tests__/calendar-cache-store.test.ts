/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { MAIL_CACHE_TTL_MS } from '../../types'
import {
  getCachedCalendarEvents,
  listCachedCalendarEvents,
  saveCalendarEvents,
} from '../calendar-cache-store'
import { wipeOfflineUserData } from '../wipe'

const userId = 'user@example.org'

describe('calendar-cache-store', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('round-trips events for the week range', async () => {
    await saveCalendarEvents(
      userId,
      '2026-08-28T00:00:00.000Z',
      '2026-09-04T23:59:59.999Z',
      [
        {
          id: 'e1',
          calendar_id: 'c1',
          title: 'Standup',
          all_day: false,
          date_start: '2026-08-28T09:00:00.000Z',
          date_end: '2026-08-28T09:30:00.000Z',
          created_at: '',
          updated_at: '',
        },
      ]
    )
    const rows = await listCachedCalendarEvents(userId)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.title).toBe('Standup')
  })

  it('hides a snapshot older than the cache TTL', async () => {
    await saveCalendarEvents(userId, 'a', 'b', [])
    const later = Date.now() + MAIL_CACHE_TTL_MS + 1
    expect(await getCachedCalendarEvents(userId, later)).toBeUndefined()
    expect(await listCachedCalendarEvents(userId, later)).toEqual([])
    expect(await getCachedCalendarEvents(userId)).toBeDefined()
  })
})
