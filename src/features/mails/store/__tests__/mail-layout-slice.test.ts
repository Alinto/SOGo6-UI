import '@testing-library/jest-dom'
import reducer, {
  setMailLayout,
  setSelectedMails,
  clearSelectedMails,
} from '../mail-layout-slice'

describe('mailLayoutSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    if (typeof window !== 'undefined') {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    }
  })

  describe('initial state', () => {
    it('has mode and selectedMailIds in state', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state).toHaveProperty('mode')
      expect(state).toHaveProperty('selectedMailIds')
      expect(Array.isArray(state.selectedMailIds)).toBe(true)
    })

    it('selectedMailIds is empty initially', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.selectedMailIds).toEqual([])
    })
  })

  describe('setMailLayout', () => {
    it('sets mode to split', () => {
      const state = reducer(undefined, setMailLayout('split'))
      expect(state.mode).toBe('split')
    })

    it('sets mode to full', () => {
      const prev = reducer(undefined, setMailLayout('split'))
      const state = reducer(prev, setMailLayout('full'))
      expect(state.mode).toBe('full')
    })
  })

  describe('setSelectedMails', () => {
    it('sets selectedMailIds', () => {
      const state = reducer(
        undefined,
        setSelectedMails(['1', '2', '3'])
      )
      expect(state.selectedMailIds).toEqual(['1', '2', '3'])
    })

    it('replaces previous selection', () => {
      const prev = reducer(undefined, setSelectedMails(['1', '2']))
      const state = reducer(prev, setSelectedMails(['3']))
      expect(state.selectedMailIds).toEqual(['3'])
    })

    it('handles empty array', () => {
      const prev = reducer(undefined, setSelectedMails(['1']))
      const state = reducer(prev, setSelectedMails([]))
      expect(state.selectedMailIds).toEqual([])
    })
  })

  describe('clearSelectedMails', () => {
    it('clears selectedMailIds', () => {
      const prev = reducer(undefined, setSelectedMails(['1', '2']))
      const state = reducer(prev, clearSelectedMails())
      expect(state.selectedMailIds).toEqual([])
    })

    it('no-op when already empty', () => {
      const state = reducer(undefined, clearSelectedMails())
      expect(state.selectedMailIds).toEqual([])
    })
  })
})
