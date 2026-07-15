import type { ImapMessages } from '@/features/mails/mails-types'
import {
  extractEventKeyFromMail,
  extractIcsFromMail,
  mailHasEventType,
} from '../extract-mail-ics'

const baseMail = (): ImapMessages =>
  ({
    attachments: { count: 0 },
    seen: false,
    answered: false,
    deleted: false,
    date: '',
    subject: '',
    from: { name: '', email: '' },
    to: [],
    cc: [],
    size: 0,
  }) as ImapMessages

describe('extractIcsFromMail', () => {
  it('returns ics_content from mail_type_data', () => {
    const mail = {
      ...baseMail(),
      mail_type_data: [{ ics_content: 'BEGIN:VCALENDAR' }],
    }
    expect(extractIcsFromMail(mail)).toBe('BEGIN:VCALENDAR')
  })

  it('returns null when no ics payload', () => {
    expect(extractIcsFromMail(baseMail())).toBeNull()
    expect(extractIcsFromMail(undefined)).toBeNull()
  })

  it('extracts event_key when present', () => {
    const mail = {
      ...baseMail(),
      mail_type_data: [{ event_key: 'evt-123' }],
    }
    expect(extractEventKeyFromMail(mail)).toBe('evt-123')
  })
})

describe('mailHasEventType', () => {
  it('detects event mail type', () => {
    expect(mailHasEventType({ ...baseMail(), mail_type: ['event'] })).toBe(true)
    expect(mailHasEventType(baseMail())).toBe(false)
  })
})
