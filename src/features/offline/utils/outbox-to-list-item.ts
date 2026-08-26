import type { ImapMessagesList } from '@/features/mails/mails-types'
import type { OutboxRecord } from '../types'

export function outboxRecordToListItem(
  item: OutboxRecord,
  options: { subject: string; snippet: string }
): ImapMessagesList {
  const recipient = item.to[0]
  return {
    id: item.id,
    subject: options.subject,
    from: {
      name: recipient?.name ?? '',
      email: recipient?.email ?? '',
    },
    to: item.to.map((recipient) => ({
      name: recipient.name ?? '',
      email: recipient.email,
    })),
    date: new Date(item.createdAt).toISOString(),
    seen: item.status !== 'failed',
    flagged: false,
    hasAttachment: item.attachmentIds.length > 0,
    snippet: options.snippet,
    answered: false,
    forwarded: false,
    deleted: false,
    priority: item.priority || 3,
    mailType: [],
  }
}
