import type { ImapMessagesList } from '@/features/mails/mails-types'
import {
  getClientFilteredMails,
  getMailListLabels,
  toMailListApiFilter,
} from '@/features/mails/utils/client-mail-list-filter'

function makeMail(overrides: Partial<ImapMessagesList> = {}): ImapMessagesList {
  return {
    id: '1',
    subject: 'S',
    from: { name: 'A', email: 'a@b.c' },
    to: [],
    date: '',
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
    ...overrides,
  }
}

describe('getClientFilteredMails', () => {
  const mails = [
    makeMail({ id: '1', seen: false, flagged: false, hasAttachment: false }),
    makeMail({ id: '2', seen: true, flagged: true, hasAttachment: true }),
    makeMail({ id: '3', seen: true, flagged: false, hasAttachment: false }),
  ]

  describe('basic filtering', () => {
    it('returns all mails for filter "all"', () => {
      expect(getClientFilteredMails(mails, 'all')).toEqual(mails)
    })

    it('returns only unseen for unread', () => {
      expect(getClientFilteredMails(mails, 'unread').map((m) => m.id)).toEqual([
        '1',
      ])
    })

    it('returns only seen for read', () => {
      expect(getClientFilteredMails(mails, 'read').map((m) => m.id)).toEqual([
        '2',
        '3',
      ])
    })

    it('returns only flagged for flagged', () => {
      expect(getClientFilteredMails(mails, 'flagged').map((m) => m.id)).toEqual(
        ['2']
      )
    })

    it('returns only mails with attachments', () => {
      expect(
        getClientFilteredMails(mails, 'attachments').map((m) => m.id)
      ).toEqual(['2'])
    })
  })

  describe('configuration', () => {
    it('returns empty array when input is empty', () => {
      expect(getClientFilteredMails([], 'unread')).toEqual([])
    })

    it('treats unknown filter as all', () => {
      expect(getClientFilteredMails(mails, 'unknown')).toEqual(mails)
    })
  })

  describe('labels', () => {
    const labelled = [
      makeMail({ id: '1', seen: false, flags: ['Work', 'toto'] }),
      makeMail({ id: '2', seen: true, flags: ['toto', 'WORK', '\\Seen'] }),
      makeMail({ id: '3', seen: false, flags: ['Work'] }),
      makeMail({ id: '4', seen: false }),
    ]
    const ids = (list: ImapMessagesList[]) => list.map((m) => m.id)

    it('keeps the mails having every label, case-insensitively', () => {
      expect(
        ids(getClientFilteredMails(labelled, 'all', ['work', 'TOTO']))
      ).toEqual(['1', '2'])
    })

    it('combines the labels with the status filter', () => {
      expect(
        ids(getClientFilteredMails(labelled, 'unread', ['Work', 'toto']))
      ).toEqual(['1'])
    })

    it('does not filter on labels without labels', () => {
      expect(getClientFilteredMails(labelled, 'all', [])).toEqual(labelled)
    })
  })
})

describe('getMailListLabels', () => {
  it('reads the repeated label params, trimmed and deduped', () => {
    const params = new URLSearchParams(
      'label=Work&label=%20toto%20&label=&label=Work&filter=unread'
    )
    expect(getMailListLabels(params)).toEqual(['Work', 'toto'])
  })

  it('dedupes labels case-insensitively, keeping the first spelling', () => {
    const params = new URLSearchParams('label=Work&label=work&label=WORK')
    expect(getMailListLabels(params)).toEqual(['Work'])
  })

  it('returns no labels without label param', () => {
    expect(getMailListLabels(new URLSearchParams('filter=read'))).toEqual([])
  })
})

describe('toMailListApiFilter', () => {
  it.each(['read', 'unread', 'flagged', 'attachments'])(
    'keeps the %s filter',
    (value) => {
      expect(toMailListApiFilter(value)).toBe(value)
    }
  )

  it.each(['all', 'starred', '', null, undefined])(
    'returns undefined for %p',
    (value) => {
      expect(toMailListApiFilter(value)).toBeUndefined()
    }
  )
})
