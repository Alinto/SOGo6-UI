import {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  mailActionQuery,
  moveToTrashQuery,
} from '../mails-api'

describe('mailsApi', () => {
  describe('getFoldersQuery', () => {
    it('should return correct query URL', () => {
      const query = getFoldersQuery()
      expect(query).toBe('mailboxes/0/folders')
    })
  })

  describe('getFolderMessagesQuery', () => {
    it('should return correct query URL without params', () => {
      const query = getFolderMessagesQuery({
        folder: 'INBOX',
      })
      expect(query).toBe('mailboxes/0/folders/INBOX/mails')
    })

    it('should return correct query URL with params', () => {
      const query = getFolderMessagesQuery({
        folder: 'INBOX',
        params: { page: 1, page_size: 10 },
      })
      expect(query).toBe('mailboxes/0/folders/INBOX/mails?page=1&page_size=10')
    })

    it('should handle multiple params', () => {
      const query = getFolderMessagesQuery({
        folder: 'Sent',
        params: {
          page: 2,
          page_size: 20,
          sort_by: 'date',
          sort_order: 'desc',
        },
      })
      expect(query).toBe(
        'mailboxes/0/folders/Sent/mails?page=2&page_size=20&sort_by=date&sort_order=desc'
      )
    })
  })

  describe('getMailQuery', () => {
    it('should return correct query URL', () => {
      const query = getMailQuery({
        folder: 'INBOX',
        mailId: '123',
      })
      expect(query).toBe('mailboxes/0/folders/INBOX/mails/123')
    })

    it('should encode special characters in folder and mailId', () => {
      const query = getMailQuery({
        folder: 'Test Folder',
        mailId: 'test@mail.com',
      })
      expect(query).toBe(
        'mailboxes/0/folders/Test%20Folder/mails/test%40mail.com'
      )
    })
  })

  describe('moveToTrashQuery', () => {
    it('should return correct mutation query', () => {
      const query = moveToTrashQuery({
        folder: 'INBOX',
        mailId: '123',
      })
      expect(query).toEqual({
        url: 'mailboxes/0/folders/INBOX/mails/123',
        method: 'DELETE',
      })
    })

    it('should encode special characters in URL', () => {
      const query = moveToTrashQuery({
        folder: 'Test Folder',
        mailId: 'test@mail.com',
      })
      expect(query.url).toBe(
        'mailboxes/0/folders/Test%20Folder/mails/test%40mail.com'
      )
    })
  })

  describe('mailActionQuery', () => {
    it('should return POST action URL and body', () => {
      const query = mailActionQuery({
        folder: 'INBOX',
        mailId: '42',
        action: 'tag',
        data: ['\\Seen'],
      })
      expect(query).toEqual({
        url: 'mailboxes/0/folders/INBOX/mails/42/action',
        method: 'POST',
        body: { action: 'tag', data: ['\\Seen'] },
      })
    })

    it('should encode folder and mailId in URL', () => {
      const query = mailActionQuery({
        accountId: '1',
        folder: 'A/B',
        mailId: 'x y',
        action: 'move',
        data: 'Archive',
      })
      expect(query.url).toBe(
        'mailboxes/1/folders/A%2FB/mails/x%20y/action'
      )
      expect(query.body).toEqual({
        action: 'move',
        data: 'Archive',
      })
    })
  })
})
