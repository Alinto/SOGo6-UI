import '@testing-library/jest-dom'
import reducer, {
  setMailNavigation,
  clearMailNavigation,
} from '../mail-navigation-slice'

describe('mailNavigationSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('has folderKey, orderedIds, page, totalPages', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state).toHaveProperty('folderKey')
      expect(state).toHaveProperty('orderedIds')
      expect(state).toHaveProperty('page')
      expect(state).toHaveProperty('totalPages')
    })

    it('folderKey is null initially', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.folderKey).toBeNull()
    })

    it('orderedIds is empty array initially', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.orderedIds).toEqual([])
    })

    it('page is 1 and totalPages is 1 initially', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.page).toBe(1)
      expect(state.totalPages).toBe(1)
    })
  })

  describe('setMailNavigation', () => {
    it('sets folderKey, orderedIds, page, totalPages', () => {
      const payload = {
        folderKey: '0/INBOX',
        orderedIds: ['42', '43', '44'],
        page: 2,
        totalPages: 5,
      }
      const state = reducer(undefined, setMailNavigation(payload))

      expect(state.folderKey).toBe('0/INBOX')
      expect(state.orderedIds).toEqual(['42', '43', '44'])
      expect(state.page).toBe(2)
      expect(state.totalPages).toBe(5)
    })

    it('replaces previous navigation state', () => {
      const prev = reducer(
        undefined,
        setMailNavigation({
          folderKey: '0/INBOX',
          orderedIds: ['1'],
          page: 1,
          totalPages: 1,
        })
      )
      const state = reducer(
        prev,
        setMailNavigation({
          folderKey: '0/Sent',
          orderedIds: ['10', '11'],
          page: 1,
          totalPages: 3,
        })
      )

      expect(state.folderKey).toBe('0/Sent')
      expect(state.orderedIds).toEqual(['10', '11'])
      expect(state.page).toBe(1)
      expect(state.totalPages).toBe(3)
    })

    it('handles nested folder in folderKey', () => {
      const payload = {
        folderKey: '0/INBOX/Archive',
        orderedIds: ['uid-123'],
        page: 1,
        totalPages: 1,
      }
      const state = reducer(undefined, setMailNavigation(payload))

      expect(state.folderKey).toBe('0/INBOX/Archive')
    })
  })

  describe('clearMailNavigation', () => {
    it('resets state to initial values', () => {
      const prev = reducer(
        undefined,
        setMailNavigation({
          folderKey: '0/INBOX',
          orderedIds: ['1', '2', '3'],
          page: 2,
          totalPages: 10,
        })
      )
      const state = reducer(prev, clearMailNavigation())

      expect(state.folderKey).toBeNull()
      expect(state.orderedIds).toEqual([])
      expect(state.page).toBe(1)
      expect(state.totalPages).toBe(1)
    })

    it('no-op when already at initial state', () => {
      const state = reducer(undefined, clearMailNavigation())

      expect(state.folderKey).toBeNull()
      expect(state.orderedIds).toEqual([])
    })
  })
})
