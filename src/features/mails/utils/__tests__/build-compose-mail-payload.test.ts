import { MAIL_PRIORITY_HIGH, MAIL_PRIORITY_NORMAL } from '../../store/mail-compose-slice'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../build-compose-mail-payload'

const baseFields: ComposeMailFields = {
  selectedIdentity: { mail: 'me@sogo.nu', replyTo: 'reply@sogo.nu' } as any,
  toRecipients: [{ email: 'to1@sogo.nu' }, { email: 'to2@sogo.nu' }],
  ccRecipients: [{ email: 'cc@sogo.nu' }],
  bccRecipients: [{ email: 'bcc@sogo.nu' }],
  subject: 'Hello',
  body: '<p>Hi</p>',
  requestReadReceipt: false,
  selectedPriority: MAIL_PRIORITY_NORMAL,
  isPlainText: false,
}

describe('buildComposeMailPayload', () => {
  it('maps recipients to plain email string arrays', () => {
    const result = buildComposeMailPayload(baseFields)
    expect(result.to).toEqual(['to1@sogo.nu', 'to2@sogo.nu'])
    expect(result.cc).toEqual(['cc@sogo.nu'])
    expect(result.bcc).toEqual(['bcc@sogo.nu'])
  })

  it('uses the selected identity mail as "from" and replyTo as "reply_to"', () => {
    const result = buildComposeMailPayload(baseFields)
    expect(result.from).toBe('me@sogo.nu')
    expect(result.reply_to).toBe('reply@sogo.nu')
  })

  it('falls back reply_to to null when replyTo is empty', () => {
    const result = buildComposeMailPayload({
      ...baseFields,
      selectedIdentity: { mail: 'me@sogo.nu', replyTo: '' } as any,
    })
    expect(result.reply_to).toBeNull()
  })

  it('sets reply_to to null when there is no selected identity', () => {
    const result = buildComposeMailPayload({
      ...baseFields,
      selectedIdentity: null,
    })
    expect(result.reply_to).toBeNull()
    expect(result.from).toBeUndefined()
  })

  it('passes subject and body through unchanged', () => {
    const result = buildComposeMailPayload(baseFields)
    expect(result.subject).toBe('Hello')
    expect(result.body).toBe('<p>Hi</p>')
  })

  it('sets return_receipt to true when requested', () => {
    const result = buildComposeMailPayload({
      ...baseFields,
      requestReadReceipt: true,
    })
    expect(result.return_receipt).toBe(true)
  })

  it('sets return_receipt to null (not false) when not requested', () => {
    const result = buildComposeMailPayload({
      ...baseFields,
      requestReadReceipt: false,
    })
    expect(result.return_receipt).toBeNull()
  })

  it('passes the selected priority through unchanged', () => {
    const result = buildComposeMailPayload({
      ...baseFields,
      selectedPriority: MAIL_PRIORITY_HIGH,
    })
    expect(result.priority).toBe(MAIL_PRIORITY_HIGH)
  })

  it('sets is_html to the inverse of isPlainText', () => {
    expect(buildComposeMailPayload({ ...baseFields, isPlainText: true }).is_html).toBe(
      false
    )
    expect(
      buildComposeMailPayload({ ...baseFields, isPlainText: false }).is_html
    ).toBe(true)
  })
})
