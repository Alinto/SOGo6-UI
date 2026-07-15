import type { ImapMessages } from '../../mails-types'
import { normalizeMailDetail } from '../../store/mails-normalizers'

describe('normalizeMailDetail', () => {
  it('normalizes mail_type and mail_type_data from snake_case API', () => {
    const mail = {
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
      mail_type: ['event'],
      mail_type_data: [{ ics_content: 'BEGIN:VCALENDAR', event_key: 'evt-1' }],
    } as ImapMessages

    const normalized = normalizeMailDetail(mail)
    expect(normalized.mailType).toEqual(['event'])
    expect(normalized.mail_type).toEqual(['event'])
    expect(normalized.mailTypeData?.[0]?.event_key).toBe('evt-1')
    expect(normalized.mail_type_data?.[0]?.ics_content).toBe('BEGIN:VCALENDAR')
  })
})
