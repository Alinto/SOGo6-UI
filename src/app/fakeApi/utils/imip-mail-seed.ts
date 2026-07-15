/** Shared iMIP fixtures for fakeApi mail + calendar seeds. */

export const IMIP_FAKEAPI_REQUEST_UID =
  'imip-fakeapi-request-001@sogo.example.org'

export const IMIP_FAKEAPI_EVENT_KEY = 'evt_imip_demo'

export const IMIP_FAKEAPI_CANCEL_UID =
  'imip-fakeapi-cancel-001@sogo.example.org'

export const IMIP_FAKEAPI_REPLY_UID = 'imip-fakeapi-reply-001@sogo.example.org'

export const IMIP_REQUEST_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SOGo//FakeApi//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:${IMIP_FAKEAPI_REQUEST_UID}
SUMMARY:Product demo (iMIP)
DTSTART:20260715T100000Z
DTEND:20260715T110000Z
LOCATION:Virtual — Teams
ORGANIZER;CN=Claire Martin:mailto:c.martin@sogomail.eu
ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:sogo-tests1@example.org
END:VEVENT
END:VCALENDAR`

export const IMIP_CANCEL_ICS = `BEGIN:VCALENDAR
VERSION:2.0
METHOD:CANCEL
BEGIN:VEVENT
UID:${IMIP_FAKEAPI_CANCEL_UID}
SUMMARY:Cancelled: Product demo (iMIP)
DTSTART:20260715T100000Z
DTEND:20260715T110000Z
ORGANIZER;CN=Claire Martin:mailto:c.martin@sogomail.eu
END:VEVENT
END:VCALENDAR`

export const IMIP_REPLY_ICS = `BEGIN:VCALENDAR
VERSION:2.0
METHOD:REPLY
BEGIN:VEVENT
UID:${IMIP_FAKEAPI_REPLY_UID}
SUMMARY:Re: Product demo (iMIP)
DTSTART:20260715T100000Z
ATTENDEE;PARTSTAT=ACCEPTED:mailto:sogo-tests1@example.org
END:VEVENT
END:VCALENDAR`
