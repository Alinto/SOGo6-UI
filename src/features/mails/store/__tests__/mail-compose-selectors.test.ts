import {
  selectActiveDraft,
  selectActiveDraftId,
  selectAllDrafts,
  selectCanOpenNewDraft,
  selectDraftById,
  selectDraftCount,
  selectIsSending,
  selectMailComposeState,
  selectOpenDraftIds,
  selectSendError,
} from '@/features/mails/store/mail-compose-selectors'
import {
  MAX_OPEN_DRAFTS,
  type MailComposeDraft,
  type MailComposeState,
} from '@/features/mails/store/mail-compose-slice'

type RootState = {
  mailCompose: MailComposeState
}

const createDraft = (
  overrides: Partial<MailComposeDraft> = {}
): MailComposeDraft => ({
  draftId: 'draft-1',
  to: [],
  cc: [],
  bcc: [],
  subject: 'Subject',
  body: '<p>Body</p>',
  attachments: [],
  priority: 'normal',
  requestReadReceipt: false,
  isDirty: false,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

const createState = (overrides: Partial<MailComposeState> = {}): RootState => ({
  mailCompose: {
    drafts: {
      'draft-1': createDraft(),
      'draft-2': createDraft({
        draftId: 'draft-2',
        subject: 'Second draft',
        createdAt: 2,
        updatedAt: 2,
      }),
    },
    activeDraftId: 'draft-1',
    openDraftIds: ['draft-1'],
    isSending: false,
    sendError: null,
    pendingInsert: null,
    ...overrides,
  },
})

describe('mail-compose-selectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('slice selection', () => {
    it('should return the full mail compose slice', () => {
      const state = createState()

      expect(selectMailComposeState(state)).toBe(state.mailCompose)
    })

    it('should return all drafts', () => {
      const state = createState()

      expect(selectAllDrafts(state)).toEqual(state.mailCompose.drafts)
    })
  })

  describe('active draft selection', () => {
    it('should return the active draft id', () => {
      const state = createState({ activeDraftId: 'draft-2' })

      expect(selectActiveDraftId(state)).toBe('draft-2')
    })

    it('should return the active draft', () => {
      const state = createState({ activeDraftId: 'draft-2' })

      expect(selectActiveDraft(state)).toEqual(
        state.mailCompose.drafts['draft-2']
      )
    })

    it('should return null when no active draft id is set', () => {
      const state = createState({ activeDraftId: null })

      expect(selectActiveDraft(state)).toBeNull()
    })
  })

  describe('draft lookup', () => {
    it('should return the requested draft by id', () => {
      const state = createState()

      expect(selectDraftById('draft-1')(state)).toEqual(
        state.mailCompose.drafts['draft-1']
      )
    })

    it('should return undefined for an unknown draft id', () => {
      const state = createState()

      expect(selectDraftById('missing')(state)).toBeUndefined()
    })

    it('should return the correct draft count', () => {
      const state = createState()

      expect(selectDraftCount(state)).toBe(2)
    })
  })

  describe('open drafts', () => {
    it('should return open draft ids in order', () => {
      const state = createState({
        openDraftIds: ['draft-3', 'draft-1', 'draft-2'],
      })

      expect(selectOpenDraftIds(state)).toEqual([
        'draft-3',
        'draft-1',
        'draft-2',
      ])
    })

    it('should allow opening a new draft below the limit', () => {
      const state = createState({
        openDraftIds: ['draft-1', 'draft-2'],
      })

      expect(selectCanOpenNewDraft(state)).toBe(true)
    })

    it('should block opening a new draft at the limit', () => {
      const state = createState({
        openDraftIds: Array.from({ length: MAX_OPEN_DRAFTS }, (_, index) => {
          return `draft-${index + 1}`
        }),
      })

      expect(selectCanOpenNewDraft(state)).toBe(false)
    })
  })

  describe('sending state', () => {
    it('should return the sending flag', () => {
      const state = createState({ isSending: true })

      expect(selectIsSending(state)).toBe(true)
    })

    it('should return the send error', () => {
      const state = createState({ sendError: 'network-error' })

      expect(selectSendError(state)).toBe('network-error')
    })
  })
})
