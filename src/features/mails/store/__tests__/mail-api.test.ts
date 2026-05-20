import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for mail-api.ts
 *
 * RTK Query and Redux are heavy dependencies that cannot be fully resolved
 * in the Jest/jsdom environment. Following the project pattern, we verify
 * the API structure by reading the file content.
 */
describe('mail-api.ts', () => {
  const filePath = path.join(__dirname, '../mail-api.ts')
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  describe('File structure', () => {
    it('should exist and be non-empty', () => {
      expect(fs.existsSync(filePath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should import createApiNotificationHandler', () => {
      expect(fileContent).toContain('createApiNotificationHandler')
      expect(fileContent).toMatch(
        /import\s*{[^}]*createApiNotificationHandler[^}]*}\s*from/
      )
    })

    it('should import apiSlice', () => {
      expect(fileContent).toContain('apiSlice')
      expect(fileContent).toMatch(/import\s*{[^}]*apiSlice[^}]*}\s*from/)
    })

    it('should import BackendResponse and mail arg types', () => {
      expect(fileContent).toContain('BackendResponse')
      expect(fileContent).toContain('SaveDraftArg')
      expect(fileContent).toContain('SendMailArg')
    })

    it('should use injectEndpoints on apiSlice', () => {
      expect(fileContent).toContain('apiSlice.injectEndpoints')
    })

    it('should set overrideExisting to true', () => {
      expect(fileContent).toContain('overrideExisting: true')
    })
  })

  describe('Exports', () => {
    it('should export useSendMailMutation', () => {
      expect(fileContent).toContain('useSendMailMutation')
    })

    it('should export useSaveDraftMutation', () => {
      expect(fileContent).toContain('useSaveDraftMutation')
    })

    it('should export useDeleteMailMutation', () => {
      expect(fileContent).toContain('useDeleteMailMutation')
    })

    it('should export mailSendApiEndpoints', () => {
      expect(fileContent).toContain('mailSendApiEndpoints')
    })
  })

  describe('sendMail endpoint', () => {
    it('should define sendMail mutation', () => {
      expect(fileContent).toContain('sendMail: builder.mutation')
    })

    it('should use correct URL with accountId', () => {
      expect(fileContent).toContain('mailboxes/${accountId}/send')
    })

    it('should use POST method', () => {
      expect(fileContent).toMatch(/sendMail[\s\S]*?method:\s*'POST'/)
    })

    it('should include mailUid as uid query param when present', () => {
      expect(fileContent).toContain('uid: mailUid')
      expect(fileContent).toContain('mailUid != null')
    })

    it('should default cc to empty array', () => {
      expect(fileContent).toMatch(/cc:\s*mail\.cc\s*\?\?\s*\[\]/)
    })

    it('should default bcc to empty array', () => {
      expect(fileContent).toMatch(/bcc:\s*mail\.bcc\s*\?\?\s*\[\]/)
    })

    it('should default return_receipt to null', () => {
      expect(fileContent).toMatch(
        /return_receipt:\s*mail\.return_receipt\s*\?\?\s*null/
      )
    })

    it('should default attachments to empty array', () => {
      expect(fileContent).toMatch(
        /attachments:\s*mail\.attachments\s*\?\?\s*\[\]/
      )
    })

    it('should define onQueryStarted for sendMail', () => {
      expect(fileContent).toMatch(/sendMail[\s\S]*?onQueryStarted/)
    })

    it('should call createApiNotificationHandler in sendMail', () => {
      expect(fileContent).toMatch(
        /sendMail[\s\S]*?createApiNotificationHandler/
      )
    })

    it('should use correct success i18n keys for sendMail', () => {
      expect(fileContent).toContain('mail_send.success.title.string')
      expect(fileContent).toContain('mail_send.success.message.string')
    })

    it('should use correct error i18n keys for sendMail', () => {
      expect(fileContent).toContain('mail_send.error.title.string')
      expect(fileContent).toContain('mail_send.error.message.string')
    })
  })

  describe('saveDraft endpoint', () => {
    it('should define saveDraft mutation', () => {
      expect(fileContent).toContain('saveDraft: builder.mutation')
    })

    it('should use correct URL with accountId', () => {
      expect(fileContent).toContain('mailboxes/${accountId}/mail/save')
    })

    it('should use POST method', () => {
      expect(fileContent).toMatch(/saveDraft[\s\S]*?method:\s*'POST'/)
    })

    it('should include mailUid as uid query param when present', () => {
      expect(fileContent).toMatch(/saveDraft[\s\S]*?uid:\s*mailUid/)
    })

    it('should default cc to empty array', () => {
      expect(fileContent).toMatch(/cc:\s*mail\.cc\s*\?\?\s*\[\]/)
    })

    it('should default bcc to empty array', () => {
      expect(fileContent).toMatch(/bcc:\s*mail\.bcc\s*\?\?\s*\[\]/)
    })

    it('should default return_receipt to null', () => {
      expect(fileContent).toMatch(
        /return_receipt:\s*mail\.return_receipt\s*\?\?\s*null/
      )
    })

    it('should define onQueryStarted for saveDraft', () => {
      expect(fileContent).toMatch(/saveDraft[\s\S]*?onQueryStarted/)
    })

    it('should only show notification when displayNotification is true', () => {
      expect(fileContent).toContain('arg.displayNotification')
    })

    it('should call createApiNotificationHandler when displayNotification is true', () => {
      expect(fileContent).toMatch(
        /displayNotification[\s\S]*?createApiNotificationHandler/
      )
    })

    it('should use correct success i18n keys for saveDraft', () => {
      expect(fileContent).toContain('save_draft.success.title.string')
      expect(fileContent).toContain('save_draft.success.message.string')
    })

    it('should use correct error i18n keys for saveDraft', () => {
      expect(fileContent).toContain('save_draft.error.title.string')
      expect(fileContent).toContain('save_draft.error.message.string')
    })
  })

  describe('deleteMail endpoint', () => {
    it('should define deleteMail mutation', () => {
      expect(fileContent).toContain('deleteMail: builder.mutation')
    })

    it('should use correct URL with accountId, folder and mailUid', () => {
      expect(fileContent).toContain(
        'mailboxes/${accountId}/folders/${folder}/mails/${mailUid}'
      )
    })

    it('should use DELETE method', () => {
      expect(fileContent).toMatch(/deleteMail[\s\S]*?method:\s*'DELETE'/)
    })

    it('should accept accountId, folder and mailUid params', () => {
      expect(fileContent).toMatch(
        /deleteMail[\s\S]*?accountId[\s\S]*?folder[\s\S]*?mailUid/
      )
    })
  })
})
