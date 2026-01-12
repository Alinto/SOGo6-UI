import {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  moveToTrashQuery,
} from '../mails-api'

describe('mailsApi', () => {
  describe('getFoldersQuery', () => {
    it('should return correct query URL', () => {
      const query = getFoldersQuery()
      expect(query).toBe('/mails/folders')
    })
  })

  describe('getFolderMessagesQuery', () => {
    it('should return correct query URL without params', () => {
      const query = getFolderMessagesQuery({
        folder: 'INBOX',
      })
      expect(query).toBe('/mails/folders/INBOX/messages')
    })

    it('should return correct query URL with params', () => {
      const query = getFolderMessagesQuery({
        folder: 'INBOX',
        params: { limit: 10, offset: 0 },
      })
      expect(query).toBe('/mails/folders/INBOX/messages?limit=10&offset=0')
    })

    it('should handle multiple params', () => {
      const query = getFolderMessagesQuery({
        folder: 'Sent',
        params: { limit: 20, sort: 'date', reverse: true },
      })
      expect(query).toBe(
        '/mails/folders/Sent/messages?limit=20&sort=date&reverse=true'
      )
    })
  })

  describe('getMailQuery', () => {
    it('should return correct query URL', () => {
      const query = getMailQuery({
        folder: 'INBOX',
        mailId: '123',
      })
      expect(query).toBe('/mails/folders/INBOX/messages/123')
    })

    it('should encode special characters in folder and mailId', () => {
      const query = getMailQuery({
        folder: 'Test Folder',
        mailId: 'test@mail.com',
      })
      expect(query).toBe(
        '/mails/folders/Test%20Folder/messages/test%40mail.com'
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
        url: '/mails/folders/INBOX/messages/123/move',
        method: 'POST',
        body: { destination: 'Trash' },
      })
    })

    it('should encode special characters in URL', () => {
      const query = moveToTrashQuery({
        folder: 'Test Folder',
        mailId: 'test@mail.com',
      })
      expect(query.url).toBe(
        '/mails/folders/Test%20Folder/messages/test%40mail.com/move'
      )
    })
  })
})
