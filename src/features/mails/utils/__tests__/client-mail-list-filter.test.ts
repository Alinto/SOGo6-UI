import type { ImapMessagesList } from '@/features/mails/mails-types'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'

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
      expect(getClientFilteredMails(mails, 'unread').map((m) => m.id)).toEqual(['1'])
    })

    it('returns only seen for read', () => {
      expect(getClientFilteredMails(mails, 'read').map((m) => m.id)).toEqual(['2', '3'])
    })

    it('returns only flagged for starred', () => {
      expect(getClientFilteredMails(mails, 'starred').map((m) => m.id)).toEqual(['2'])
    })

    it('returns only mails with attachments', () => {
      expect(getClientFilteredMails(mails, 'attachments').map((m) => m.id)).toEqual(['2'])
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
})
