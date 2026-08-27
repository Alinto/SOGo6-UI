import {
  addressBookGrantSummary,
  calendarGrantSummary,
  mailGrantSummary,
} from '../grant-summary'

const t = (key: string) => key

describe('mailGrantSummary', () => {
  it('returns an empty string when no rights are active', () => {
    expect(mailGrantSummary({}, t)).toBe('')
  })

  it('lists the active simplified permission labels', () => {
    const summary = mailGrantSummary(
      { userCanViewFolder: 1, userCanReadMails: 1 },
      t
    )
    expect(summary).toBe('folders.actions.sharing.simplified.read.label.string')
  })
})

describe('calendarGrantSummary', () => {
  it('returns the "none" label when nothing is granted', () => {
    const summary = calendarGrantSummary(
      {
        public: 'none',
        confidential: 'none',
        private: 'none',
        can_create_objects: false,
        can_erase_objects: false,
      },
      t
    )
    expect(summary).toBe('sidebar.sharing.levels.none.label.string')
  })

  it('returns the highest classification level across public/confidential/private', () => {
    const summary = calendarGrantSummary(
      {
        public: 'view-date-time',
        confidential: 'modify',
        private: 'respond-to',
        can_create_objects: false,
        can_erase_objects: false,
      },
      t
    )
    expect(summary).toBe('sidebar.sharing.levels.modify.label.string')
  })

  it('ranks "respond-to" between "view-all" and "modify"', () => {
    const summary = calendarGrantSummary(
      {
        public: 'respond-to',
        confidential: 'view-all',
        private: 'none',
        can_create_objects: false,
        can_erase_objects: false,
      },
      t
    )
    expect(summary).toBe('sidebar.sharing.levels.respond.label.string')
  })
})

describe('addressBookGrantSummary', () => {
  it('returns an empty string when no rights are active', () => {
    const summary = addressBookGrantSummary(
      {
        can_view: false,
        can_create_objects: false,
        can_edit_objects: false,
        can_erase_objects: false,
      },
      t
    )
    expect(summary).toBe('')
  })

  it('lists every active permission label', () => {
    const summary = addressBookGrantSummary(
      {
        can_view: true,
        can_create_objects: true,
        can_edit_objects: false,
        can_erase_objects: false,
      },
      t
    )
    expect(summary).toBe(
      'sharing.permissions.canView.label.string, sharing.permissions.canCreateObjects.label.string'
    )
  })
})
