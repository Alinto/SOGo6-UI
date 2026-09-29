import type { ImapMessagesBackendResponse } from '../../mails-types'
import {
  mapMailToListItem,
  normalizeFolderRights,
  normalizeImapFolder,
  recomputePagination,
  transformFolderMessagesResponse,
} from '../mails-normalizers'

describe('normalizeFolderRights', () => {
  it('returns undefined when no rights object was sent', () => {
    expect(normalizeFolderRights(undefined)).toBeUndefined()
    expect(normalizeFolderRights(null)).toBeUndefined()
    expect(normalizeFolderRights('lr')).toBeUndefined()
    expect(normalizeFolderRights([])).toBeUndefined()
  })

  it('keeps an empty object as "no right at all"', () => {
    expect(normalizeFolderRights({})).toEqual({})
  })

  it('reads camelCase rights sent on folders', () => {
    expect(
      normalizeFolderRights({ userCanViewFolder: 1, userCanReadMails: 1 })
    ).toEqual({ userCanViewFolder: 1, userCanReadMails: 1 })
  })

  it('reads snake_case rights sent on mails', () => {
    expect(
      normalizeFolderRights({
        user_can_view_folder: 1,
        user_can_mark_mails_read: 1,
      })
    ).toEqual({ userCanViewFolder: 1, userCanMarkMailsRead: 1 })
  })

  it('drops unknown keys and non-granted values', () => {
    expect(
      normalizeFolderRights({
        userCanViewFolder: 1,
        userCanReadMails: 0,
        somethingElse: 1,
      })
    ).toEqual({ userCanViewFolder: 1 })
  })
})

describe('rights in normalized payloads', () => {
  const baseFolder = {
    name: 'Shared',
    path: 'Shared',
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
  }

  it('normalizes folder rights recursively', () => {
    const folder = normalizeImapFolder({
      ...baseFolder,
      rights: { userCanViewFolder: 1 },
      children: [
        {
          ...baseFolder,
          path: 'Shared/Sub',
          rights: { user_can_read_mails: 1 },
        },
      ],
    })
    expect(folder.rights).toEqual({ userCanViewFolder: 1 })
    expect(folder.children?.[0].rights).toEqual({ userCanReadMails: 1 })
  })

  it('leaves rights undefined on folders without rights', () => {
    expect(normalizeImapFolder(baseFolder).rights).toBeUndefined()
  })

  it('keeps mail rights on list items', () => {
    const item = mapMailToListItem({
      uid: '1',
      folder: 'Shared',
      rights: { user_can_view_folder: 1, user_can_read_mails: 1 },
    })
    expect(item.rights).toEqual({
      userCanViewFolder: 1,
      userCanReadMails: 1,
    })
  })
})

function metaWithPagination(pagination?: object) {
  const headers = {
    get: (name: string) =>
      name === 'X-Pagination' && pagination ? JSON.stringify(pagination) : null,
  }
  return { response: { headers } as unknown as Response }
}

describe('transformFolderMessagesResponse', () => {
  it('derives pagination from the X-Pagination header (raw array payload)', () => {
    const meta = metaWithPagination({
      total: 42,
      total_pages: 3,
      page: 2,
    })
    const result = transformFolderMessagesResponse(
      { data: [{ uid: '1', subject: 'Hi' }] } as never,
      meta
    )
    expect(result.total).toBe(42)
    expect(result.totalPages).toBe(3)
    expect(result.page).toBe(2)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPreviousPage).toBe(true)
    expect(result.mails).toHaveLength(1)
    expect(result.mails[0].id).toBe('1')
  })

  it('falls back to body totals when no header ({ mails } shape)', () => {
    const result = transformFolderMessagesResponse(
      {
        data: {
          mails: [{ uid: 'a' }, { uid: 'b' }],
          total: 2,
          page: 1,
          totalPages: 1,
        },
      } as never,
      metaWithPagination()
    )
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPreviousPage).toBe(false)
  })

  it('supports the { messages } payload shape', () => {
    const result = transformFolderMessagesResponse(
      {
        messages: [{ uid: 'x' }],
        total: 1,
        page: 1,
        totalPages: 1,
      } as never,
      metaWithPagination()
    )
    expect(result.mails).toHaveLength(1)
    expect(result.mails[0].id).toBe('x')
  })

  it('recovers gracefully from invalid X-Pagination JSON', () => {
    const meta = {
      response: {
        headers: { get: () => '{not valid json' },
      } as unknown as Response,
    }
    const result = transformFolderMessagesResponse(
      { data: [{ uid: '1' }] } as never,
      meta
    )
    // Header present-but-invalid: body totals are not re-derived (defaults kept),
    // but the mails still parse correctly and pagination stays safe.
    expect(result.mails).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(1)
    expect(result.hasNextPage).toBe(false)
  })
})

describe('recomputePagination', () => {
  const base = (): ImapMessagesBackendResponse => ({
    mails: [],
    total: 0,
    page: 2,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: true,
  })

  it('recomputes totalPages from total and page size', () => {
    const draft = { ...base(), total: 21 }
    recomputePagination(draft, 20)
    expect(draft.totalPages).toBe(2)
    expect(draft.hasNextPage).toBe(false)
    expect(draft.hasPreviousPage).toBe(true)
  })

  it('sets totalPages to 0 when the folder is empty', () => {
    const draft = { ...base(), total: 0 }
    recomputePagination(draft, 20)
    expect(draft.totalPages).toBe(0)
    expect(draft.hasNextPage).toBe(false)
  })

  it('defaults page size to 20 when invalid', () => {
    const draft = { ...base(), total: 40 }
    recomputePagination(draft, 0)
    expect(draft.totalPages).toBe(2)
  })
})
