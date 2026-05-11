import '@testing-library/jest-dom'
import reducer, {
  clearCreateEventRequest,
  requestCreateEvent,
} from '../calendar-ui-slice'

describe('calendarUiSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('has createEventRequested false', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state).toHaveProperty('createEventRequested')
      expect(state.createEventRequested).toBe(false)
    })
  })

  describe('requestCreateEvent', () => {
    it('sets createEventRequested to true', () => {
      const state = reducer(undefined, requestCreateEvent())
      expect(state.createEventRequested).toBe(true)
    })

    it('sets true when invoked from false state', () => {
      const prev = reducer(undefined, { type: '@@INIT' })
      expect(prev.createEventRequested).toBe(false)
      const next = reducer(prev, requestCreateEvent())
      expect(next.createEventRequested).toBe(true)
    })

    it('keeps true when invoked again from true state', () => {
      const prev = reducer(undefined, requestCreateEvent())
      const next = reducer(prev, requestCreateEvent())
      expect(next.createEventRequested).toBe(true)
    })
  })

  describe('clearCreateEventRequest', () => {
    it('sets createEventRequested to false', () => {
      const prev = reducer(undefined, requestCreateEvent())
      expect(prev.createEventRequested).toBe(true)
      const state = reducer(prev, clearCreateEventRequest())
      expect(state.createEventRequested).toBe(false)
    })

    it('is idempotent when already false', () => {
      const prev = reducer(undefined, { type: '@@INIT' })
      const state = reducer(prev, clearCreateEventRequest())
      expect(state.createEventRequested).toBe(false)
    })
  })

  describe('action flow', () => {
    it('request then clear returns to initial shape', () => {
      let state = reducer(undefined, { type: '@@INIT' })
      state = reducer(state, requestCreateEvent())
      expect(state.createEventRequested).toBe(true)
      state = reducer(state, clearCreateEventRequest())
      expect(state.createEventRequested).toBe(false)
    })
  })

  describe('exports', () => {
    it('exports named action creators', () => {
      expect(typeof requestCreateEvent).toBe('function')
      expect(typeof clearCreateEventRequest).toBe('function')
    })

    it('default export is a function reducer', () => {
      expect(typeof reducer).toBe('function')
    })
  })
})
