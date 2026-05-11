import reducer, {
  setPendingInsert,
} from '../mail-compose-slice'

describe('mailComposeSlice', () => {
  describe('pendingInsert', () => {
    it('should have pendingInsert as null in initial state', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.pendingInsert).toBeNull()
    })

    it('should set pendingInsert when setPendingInsert is dispatched with a string', () => {
      const state = reducer(undefined, setPendingInsert('hello'))
      expect(state.pendingInsert).toBe('hello')
    })

    it('should reset pendingInsert to null when setPendingInsert(null) is dispatched', () => {
      const stateWithValue = reducer(undefined, setPendingInsert('hello'))
      const stateReset = reducer(stateWithValue, setPendingInsert(null))
      expect(stateReset.pendingInsert).toBeNull()
    })

    it('should set pendingInsert to an HTML string', () => {
      const html = '<a href="https://meet.jitsi.si/abc">https://meet.jitsi.si/abc</a>'
      const state = reducer(undefined, setPendingInsert(html))
      expect(state.pendingInsert).toBe(html)
    })
  })
})
