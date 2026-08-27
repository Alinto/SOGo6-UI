import type { FolderShareUser } from '../../mails-types'
import {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  mailActionQuery,
  moveToTrashQuery,
  setFolderShareQuery,
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

  describe('setFolderShareQuery', () => {
    const baseUser: FolderShareUser = {
      uid: 'jnadal@snapshot.alinto.org',
      c_email: 'jnadal@snapshot.alinto.org',
      userClass: 'normal-user',
      rights: {
        userCanViewFolder: 1,
        userCanReadMails: 1,
        userCanMarkMailsRead: 1,
        userCanWriteMails: 1,
      },
    }

    it('should PUT to the share endpoint', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [baseUser],
      })
      expect(query.url).toBe('mailboxes/0/folders/INBOX/share')
      expect(query.method).toBe('PUT')
    })

    it('should send do_subfolders: true per-user when that user opted in', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [{ ...baseUser, applyToSubfolders: true }],
      })
      expect(query.body[0].do_subfolders).toBe(true)
    })

    it('should default do_subfolders to false when not set on the user', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [baseUser],
      })
      expect(query.body[0].do_subfolders).toBe(false)
    })

    it('should let each user carry its own do_subfolders independently', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [
          { ...baseUser, uid: 'a@example.com', applyToSubfolders: true },
          { ...baseUser, uid: 'b@example.com', applyToSubfolders: false },
        ],
      })
      expect(query.body[0].do_subfolders).toBe(true)
      expect(query.body[1].do_subfolders).toBe(false)
    })

    it('should send the body as a bare array with c_email/uid/user_class', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [baseUser],
      })
      expect(Array.isArray(query.body)).toBe(true)
      expect(query.body[0]).toEqual(
        expect.objectContaining({
          c_email: 'jnadal@snapshot.alinto.org',
          uid: 'jnadal@snapshot.alinto.org',
          user_class: 'user',
        })
      )
    })

    it('should not include the (now redundant) rights key in the wire payload', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [baseUser],
      })
      expect(query.body[0]).not.toHaveProperty('rights')
    })

    it('should map userClass "public-user" to user_class "public"', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [{ ...baseUser, userClass: 'public-user' }],
      })
      expect(query.body[0].user_class).toBe('public')
    })

    it('should always send the advanced IMAP codes derived from rights', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [baseUser],
      })
      expect(query.body[0].permissions).toEqual(['l', 'r', 's', 'w'])
      expect(query.body[0]).not.toHaveProperty('type')
    })

    it('should derive IMAP codes from rights even for a partial/advanced-only combination', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [{ ...baseUser, rights: { userCanReadMails: 1 } }],
      })
      expect(query.body[0].permissions).toEqual(['r'])
    })

    it('should ignore any pre-set permissions field and always recompute from rights', () => {
      const query = setFolderShareQuery({
        accountId: '0',
        folderPath: 'INBOX',
        users: [
          {
            ...baseUser,
            rights: { userCanPostMails: 1 },
            permissions: ['not-derived-from-rights'],
          },
        ],
      })
      expect(query.body[0].permissions).toEqual(['p'])
    })
  })
})
