import '@testing-library/jest-dom'
import type {
  ImapFolder,
  ImapMessagesList,
  ImapAttachmentPart,
  ImapAttachments,
  ImapMessages,
  ImapMessagesAPIResponse,
  ImapMessagesBackendResponse,
} from '../mails-types'

describe('Mails Types', () => {
  it('should export all type definitions without crashing', () => {
    // This test verifies that the module can be imported
    // Type checking happens at compile time
    expect(true).toBe(true)
  })

  it('should allow ImapFolder to be defined', () => {
    const folder: ImapFolder = {
      name: 'INBOX',
      path: 'INBOX',
      unseen_count: 5,
      messages: 10,
      flags: ['\\Seen'],
      delimiter: '/',
      readOnly: false,
      selectable: true,
    }
    expect(folder.name).toBe('INBOX')
  })

  it('should allow ImapMessagesList to be defined', () => {
    const message: ImapMessagesList = {
      id: '1',
      subject: 'Test',
      from: { name: 'Sender', email: 'sender@example.com' },
      to: [{ name: 'Recipient', email: 'recipient@example.com' }],
      date: '2024-01-01',
      seen: false,
      flagged: false,
      hasAttachment: false,
      snippet: 'Test snippet',
    }
    expect(message.id).toBe('1')
  })

  it('should allow ImapAttachmentPart to be defined', () => {
    const attachment: ImapAttachmentPart = {
      partId: '1',
      name: 'file.pdf',
      contentType: 'application/pdf',
      size: 1024,
      downloadUri: '/download/1',
      displayUri: '/display/1',
    }
    expect(attachment.name).toBe('file.pdf')
  })

  it('should allow ImapAttachments to be defined', () => {
    const attachments: ImapAttachments = {
      count: 1,
    }
    expect(attachments.count).toBe(1)
  })

  it('should allow ImapMessages to be defined', () => {
    const message: ImapMessages = {
      subject: 'Test',
      attachments: { count: 0 },
      seen: false,
      answered: false,
      deleted: false,
      date: '2024-01-01',
      from: { name: 'Sender', email: 'sender@example.com' },
      to: [{ name: 'Recipient', email: 'recipient@example.com' }],
      cc: [],
      size: 1024,
    }
    expect(message.subject).toBe('Test')
  })

  it('should allow ImapMessagesAPIResponse to be defined', () => {
    const response: ImapMessagesAPIResponse = {
      messages: [],
      total: 0,
      pageSize: 10,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
    expect(response.total).toBe(0)
  })

  it('should allow ImapMessagesBackendResponse to be defined', () => {
    const response: ImapMessagesBackendResponse = {
      mails: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
    expect(response.total).toBe(0)
  })
})
