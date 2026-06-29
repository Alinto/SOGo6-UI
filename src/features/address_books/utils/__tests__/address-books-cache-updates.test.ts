import type { BookEntriesResponse } from '../../address-books-api-types'
import type { VCard } from '../../address-books-types'

const mockSelectCachedArgsForQuery = jest.fn()
const mockUpdateQueryData = jest.fn()

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    util: {
      selectCachedArgsForQuery: (...args: unknown[]) =>
        mockSelectCachedArgsForQuery(...args),
      updateQueryData: (...args: unknown[]) => mockUpdateQueryData(...args),
    },
  },
}))

import {
  patchAllBookEntryCaches,
  patchVCardDetailCache,
  removeEntryFromBookCaches,
  undoEntryCachePatches,
  upsertEntryInBookCaches,
} from '../address-books-cache-updates'

const baseContact: VCard = {
  id: 'c1',
  version: '4.0',
  firstName: 'Alice',
  lastName: 'Martin',
  kind: 'individual',
}

function createDraft(): BookEntriesResponse {
  return {
    items: [{ ...baseContact }],
    total: 1,
    contactTotal: 1,
    listTotal: 0,
    page: 1,
    totalPages: 1,
  }
}

describe('address-books-cache-updates', () => {
  const mockDispatch = jest.fn()
  const mockGetState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockImplementation((action: unknown) => action)
    mockGetState.mockReturnValue({})
  })

  describe('patchAllBookEntryCaches', () => {
    it('patches only cached queries for the requested book', () => {
      mockSelectCachedArgsForQuery.mockReturnValue([
        { bookId: 'work', params: { page: 1 } },
        'other-book',
        'work',
      ])

      const undos = [{ undo: jest.fn() }, { undo: jest.fn() }]
      mockUpdateQueryData
        .mockReturnValueOnce(undos[0])
        .mockReturnValueOnce(undos[1])

      const recipe = jest.fn()
      const result = patchAllBookEntryCaches(
        mockDispatch,
        mockGetState,
        'work',
        recipe
      )

      expect(mockUpdateQueryData).toHaveBeenCalledTimes(2)
      expect(mockUpdateQueryData).toHaveBeenCalledWith(
        'getAddressBookVCards',
        { bookId: 'work', params: { page: 1 } },
        recipe
      )
      expect(mockUpdateQueryData).toHaveBeenCalledWith(
        'getAddressBookVCards',
        'work',
        recipe
      )
      expect(result).toEqual(undos)
    })
  })

  describe('upsertEntryInBookCaches', () => {
    it('updates an existing entry in place', () => {
      mockSelectCachedArgsForQuery.mockReturnValue(['work'])
      mockUpdateQueryData.mockImplementation((_endpoint, _arg, recipe) => {
        const draft = createDraft()
        recipe(draft)
        expect(draft.items[0].firstName).toBe('Alicia')
        expect(draft.total).toBe(1)
        return { undo: jest.fn() }
      })

      upsertEntryInBookCaches(mockDispatch, mockGetState, 'work', {
        ...baseContact,
        firstName: 'Alicia',
      })
    })

    it('prepends a new contact and increments contact totals', () => {
      mockSelectCachedArgsForQuery.mockReturnValue(['work'])
      mockUpdateQueryData.mockImplementation((_endpoint, _arg, recipe) => {
        const draft = createDraft()
        recipe(draft)
        expect(draft.items).toHaveLength(2)
        expect(draft.items[0].id).toBe('c2')
        expect(draft.total).toBe(2)
        expect(draft.contactTotal).toBe(2)
        expect(draft.listTotal).toBe(0)
        return { undo: jest.fn() }
      })

      upsertEntryInBookCaches(mockDispatch, mockGetState, 'work', {
        id: 'c2',
        version: '4.0',
        firstName: 'Bob',
        lastName: 'Smith',
        kind: 'individual',
      })
    })

    it('increments list totals for new groups', () => {
      mockSelectCachedArgsForQuery.mockReturnValue(['work'])
      mockUpdateQueryData.mockImplementation((_endpoint, _arg, recipe) => {
        const draft = createDraft()
        recipe(draft)
        expect(draft.listTotal).toBe(1)
        expect(draft.contactTotal).toBe(1)
        return { undo: jest.fn() }
      })

      upsertEntryInBookCaches(mockDispatch, mockGetState, 'work', {
        id: 'g1',
        version: '4.0',
        firstName: 'Team',
        lastName: 'A',
        kind: 'group',
      })
    })
  })

  describe('removeEntryFromBookCaches', () => {
    it('removes an entry and decrements contact totals', () => {
      mockSelectCachedArgsForQuery.mockReturnValue(['work'])
      mockUpdateQueryData.mockImplementation((_endpoint, _arg, recipe) => {
        const draft = createDraft()
        recipe(draft)
        expect(draft.items).toHaveLength(0)
        expect(draft.total).toBe(0)
        expect(draft.contactTotal).toBe(0)
        return { undo: jest.fn() }
      })

      removeEntryFromBookCaches(mockDispatch, mockGetState, 'work', 'c1')
    })
  })

  describe('undoEntryCachePatches', () => {
    it('calls undo on every patch', () => {
      const undoA = jest.fn()
      const undoB = jest.fn()

      undoEntryCachePatches([{ undo: undoA }, { undo: undoB }])

      expect(undoA).toHaveBeenCalledTimes(1)
      expect(undoB).toHaveBeenCalledTimes(1)
    })
  })

  describe('patchVCardDetailCache', () => {
    it('dispatches a detail cache update and returns the patch', () => {
      const patch = { undo: jest.fn() }
      const recipe = jest.fn()
      mockUpdateQueryData.mockReturnValue(patch)

      const result = patchVCardDetailCache(
        mockDispatch,
        { book_id: 'work', id: 'c1' },
        recipe
      )

      expect(mockUpdateQueryData).toHaveBeenCalledWith('getVCard', {
        book_id: 'work',
        id: 'c1',
      }, recipe)
      expect(result).toBe(patch)
    })
  })
})
