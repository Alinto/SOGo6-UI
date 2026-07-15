import { parseMailIcs } from '../parse-mail-ics'

const REQUEST_ICS = `BEGIN:VCALENDAR
VERSION:2.0
METHOD:REQUEST
BEGIN:VEVENT
UID:imip-test-uid-001@example.org
SUMMARY:Team sync
DTSTART:20260715T100000Z
DTEND:20260715T110000Z
LOCATION:Room A
ORGANIZER;CN=Alice:mailto:alice@example.com
ATTENDEE;PARTSTAT=NEEDS-ACTION:mailto:bob@example.com
END:VEVENT
END:VCALENDAR`

const FOLDED_ICS = `BEGIN:VCALENDAR
VERSION:2.0
METHOD:REQUEST
BEGIN:VEVENT
UID:folded-uid@example.org
SUMMARY:Long
 meeting
DTSTART:20260716T090000Z
DTEND:20260716T100000Z
END:VEVENT
END:VCALENDAR`

const CANCEL_ICS = `BEGIN:VCALENDAR
METHOD:CANCEL
BEGIN:VEVENT
UID:cancel-uid@example.org
SUMMARY:Cancelled meeting
DTSTART:20260717T140000Z
END:VEVENT
END:VCALENDAR`

const REPLY_ICS = `BEGIN:VCALENDAR
METHOD:REPLY
BEGIN:VEVENT
UID:reply-uid@example.org
SUMMARY:Re: Team sync
DTSTART:20260715T100000Z
ATTENDEE;PARTSTAT=ACCEPTED:mailto:bob@example.com
END:VEVENT
END:VCALENDAR`

describe('parseMailIcs', () => {
  it('parses a REQUEST invitation', () => {
    const parsed = parseMailIcs(REQUEST_ICS)
    expect(parsed).toMatchObject({
      method: 'REQUEST',
      uid: 'imip-test-uid-001@example.org',
      summary: 'Team sync',
      location: 'Room A',
      dtStart: '2026-07-15T10:00:00.000Z',
      dtEnd: '2026-07-15T11:00:00.000Z',
      organizer: { email: 'alice@example.com', name: 'Alice' },
    })
  })

  it('unfolds folded lines', () => {
    const parsed = parseMailIcs(FOLDED_ICS)
    expect(parsed?.summary).toBe('Longmeeting')
    expect(parsed?.uid).toBe('folded-uid@example.org')
  })

  it('parses CANCEL method', () => {
    const parsed = parseMailIcs(CANCEL_ICS)
    expect(parsed?.method).toBe('CANCEL')
    expect(parsed?.summary).toBe('Cancelled meeting')
  })

  it('parses REPLY with attendee status', () => {
    const parsed = parseMailIcs(REPLY_ICS)
    expect(parsed?.method).toBe('REPLY')
    expect(parsed?.replyAttendeeStatus).toBe('accepted')
    expect(parsed?.replyAttendeeEmail).toBe('bob@example.com')
  })

  it('returns null for invalid input', () => {
    expect(parseMailIcs('')).toBeNull()
    expect(parseMailIcs('not calendar')).toBeNull()
    expect(parseMailIcs('BEGIN:VCALENDAR\nEND:VCALENDAR')).toBeNull()
  })
})
