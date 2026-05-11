import type { ImapMessages } from '@/features/mails/mails-types'

function parseMailboxAddress(
  value: string
): { name: string; email: string } {
  const m = value.match(/^(?:"?([^"]*)"?\s)?\s*<?([^<>\s]+@[^>\s]+)>?\s*$/)
  if (m) {
    return { name: (m[1] || m[2] || '').trim(), email: (m[2] || '').trim() }
  }
  if (value.includes('@')) {
    return { name: value.trim(), email: value.trim() }
  }
  return { name: value.trim(), email: '' }
}

function parseRecipientLine(addr: string): { name: string; email: string } {
  if (addr.includes('<') && addr.includes('>')) {
    return parseMailboxAddress(addr)
  }
  if (addr.includes('@')) {
    return { name: addr.trim(), email: addr.trim() }
  }
  return { name: addr.trim(), email: '' }
}

type DemoMailShape = Omit<ImapMessages, 'from' | 'to' | 'cc' | 'bcc'> & {
  from?: ImapMessages['from'] | string
  to?: ImapMessages['to'] | string[]
  cc?: ImapMessages['cc'] | string[]
  bcc?: ImapMessages['bcc'] | string[]
}

/**
 * Adapte les messages démo (from chaîne, to string[]) au type ImapMessages.
 */
export function normalizeDemoMailDetail(mail: DemoMailShape): ImapMessages {
  let from: ImapMessages['from'] = mail.from as ImapMessages['from']
  if (typeof mail.from === 'string') {
    from = parseMailboxAddress(mail.from)
  }

  let to = mail.to as ImapMessages['to']
  if (Array.isArray(mail.to) && mail.to.length > 0 && typeof mail.to[0] === 'string') {
    to = (mail.to as string[]).map(parseRecipientLine)
  }

  let cc: ImapMessages['cc'] = (mail.cc || []) as ImapMessages['cc']
  if (Array.isArray(mail.cc) && mail.cc.length > 0 && typeof mail.cc[0] === 'string') {
    cc = (mail.cc as string[]).map(parseRecipientLine)
  }

  let bcc: ImapMessages['bcc'] = (mail.bcc || []) as ImapMessages['bcc']
  if (
    Array.isArray(mail.bcc) &&
    mail.bcc.length > 0 &&
    typeof mail.bcc[0] === 'string'
  ) {
    bcc = (mail.bcc as string[]).map(parseRecipientLine)
  }

  return {
    ...mail,
    from,
    to,
    cc,
    bcc,
  }
}
