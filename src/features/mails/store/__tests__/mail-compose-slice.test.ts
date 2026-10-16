import reducer, {
  createDraft,
  markDraftSaved,
  renameRecipients,
  setPendingInsert,
  updateRecipients,
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
      const html =
        '<a href="https://meet.jitsi.si/abc">https://meet.jitsi.si/abc</a>'
      const state = reducer(undefined, setPendingInsert(html))
      expect(state.pendingInsert).toBe(html)
    })
  })

  describe('renameRecipients', () => {
    const withRecipients = () => {
      let state = reducer(undefined, createDraft({ draftId: 'd1' }))
      state = reducer(
        state,
        updateRecipients({
          draftId: 'd1',
          field: 'to',
          recipients: [
            { email: 'Jean@example.com', name: 'Jean' },
            { email: 'bob@example.com', name: 'Bob' },
          ],
        })
      )
      state = reducer(
        state,
        updateRecipients({
          draftId: 'd1',
          field: 'cc',
          recipients: [{ email: 'jean@example.com' }],
        })
      )
      return reducer(state, markDraftSaved({ draftId: 'd1' }))
    }

    it('renames matching recipients in every field, ignoring case', () => {
      const state = reducer(
        withRecipients(),
        renameRecipients({
          emails: ['jean@example.com'],
          name: 'Jean Dupont',
        })
      )
      const draft = state.drafts.d1
      expect(draft.to).toEqual([
        { email: 'Jean@example.com', name: 'Jean Dupont' },
        { email: 'bob@example.com', name: 'Bob' },
      ])
      expect(draft.cc).toEqual([
        { email: 'jean@example.com', name: 'Jean Dupont' },
      ])
      expect(draft.isDirty).toBe(true)
    })

    it('drops the name when the contact has none', () => {
      const state = reducer(
        withRecipients(),
        renameRecipients({ emails: ['bob@example.com'], name: ' ' })
      )
      expect(state.drafts.d1.to[1]).toEqual({ email: 'bob@example.com' })
    })

    it('leaves drafts without a match untouched', () => {
      const before = withRecipients()
      const state = reducer(
        before,
        renameRecipients({ emails: ['other@example.com'], name: 'Other' })
      )
      expect(state.drafts.d1).toBe(before.drafts.d1)
    })
  })
})
