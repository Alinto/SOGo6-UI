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

    it('should use correct URL with accountId and mailKey', () => {
      expect(fileContent).toContain(
        'mailboxes/${accountId}/mail/${mailKey}/send'
      )
    })

    it('should use correct URL with accountId', () => {
      expect(fileContent).toContain('mailboxes/${accountId}/mail/send')
    })

    it('should use POST method', () => {
      expect(fileContent).toMatch(/sendMail[\s\S]*?method:\s*'POST'/)
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

    it('should default priority to MAIL_PRIORITY_NORMAL', () => {
      expect(fileContent).toMatch(
        /priority:\s*mail\.priority\s*\?\?\s*MAIL_PRIORITY_NORMAL/
      )
    })

    it('should default is_html to true', () => {
      expect(fileContent).toMatch(/is_html:\s*mail\.is_html\s*\?\?\s*true/)
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

    it('should include mailKey in URL when present', () => {
      expect(fileContent).toContain(
        '`mailboxes/${accountId}/mail/${mailKey}/save`'
      )
    })

    it('should include close as query param when close is true', () => {
      expect(fileContent).toMatch(
        /params:\s*close\s*\?\s*\{\s*close:\s*true\s*\}/
      )
    })

    it('should use PUT method when mailKey is present', () => {
      expect(fileContent).toMatch(
        /method:\s*mailKey != null\s*\?\s*['"]PUT['"]\s*:\s*['"]POST['"]/
      )
    })

    it('should build correct URL with mailKey', () => {
      expect(fileContent).toMatch(
        /`mailboxes\/\$\{accountId\}\/mail\/\$\{mailKey\}\/save`/
      )
    })

    it('should build correct URL without mailKey', () => {
      expect(fileContent).toMatch(/`mailboxes\/\$\{accountId\}\/mail\/save`/)
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

    it('should default priority to MAIL_PRIORITY_NORMAL', () => {
      expect(fileContent).toMatch(
        /priority:\s*mail\.priority\s*\?\?\s*MAIL_PRIORITY_NORMAL/
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

    it('should use DELETE method', () => {
      expect(fileContent).toMatch(/deleteMail[\s\S]*?method:\s*'DELETE'/)
    })

    it('should accept accountId and mailKey params', () => {
      expect(fileContent).toMatch(/deleteMail[\s\S]*?accountId[\s\S]*?mailKey/)
    })

    it('should use correct URL with accountId and mailKey', () => {
      expect(fileContent).toContain('`mailboxes/${accountId}/mail/${mailKey}`')
    })

    describe('Exports', () => {
      // Already has useSendMailMutation, useSaveDraftMutation, useDeleteMailMutation
      // Missing:
      it('should export useUploadAttachmentMutation', () => {
        expect(fileContent).toContain('useUploadAttachmentMutation')
      })

      it('should export useDeleteAttachmentMutation', () => {
        expect(fileContent).toContain('useDeleteAttachmentMutation')
      })

      it('should export useLazyDownloadAttachmentQuery', () => {
        expect(fileContent).toContain('useLazyDownloadAttachmentQuery')
      })
    })

    describe('deleteMail endpoint', () => {
      it('should use correct URL with accountId and mailKey', () => {
        expect(fileContent).toContain(
          '`mailboxes/${accountId}/mail/${mailKey}`'
        )
      })

      it('should accept accountId and mailKey params', () => {
        expect(fileContent).toMatch(
          /deleteMail[\s\S]*?accountId[\s\S]*?mailKey/
        )
      })

      it('should call createApiNotificationHandler in deleteMail', () => {
        expect(fileContent).toMatch(
          /deleteMail[\s\S]*?createApiNotificationHandler/
        )
      })

      it('should use correct success i18n keys for deleteMail', () => {
        expect(fileContent).toContain('discard_draft.success.title.string')
        expect(fileContent).toContain('discard_draft.success.message.string')
      })

      it('should use correct error i18n keys for deleteMail', () => {
        expect(fileContent).toContain('discard_draft.error.title.string')
        expect(fileContent).toContain('discard_draft.error.message.string')
      })
    })

    describe('uploadAttachment endpoint', () => {
      it('should define uploadAttachment mutation', () => {
        expect(fileContent).toContain('uploadAttachment: builder.mutation')
      })

      it('should use POST method', () => {
        expect(fileContent).toMatch(/uploadAttachment[\s\S]*?method:\s*'POST'/)
      })

      it('should use correct URL with mailKey when present', () => {
        expect(fileContent).toContain(
          '`mailboxes/${accountId}/mail/${mailKey}/attachments`'
        )
      })

      it('should use correct URL without mailKey', () => {
        expect(fileContent).toContain(
          '`mailboxes/${accountId}/mail/attachments`'
        )
      })

      it('should append file to FormData', () => {
        expect(fileContent).toContain('formData.append')
        expect(fileContent).toContain("formData.append('file', file)")
      })

      it('should call createApiNotificationHandler in uploadAttachment', () => {
        expect(fileContent).toMatch(
          /uploadAttachment[\s\S]*?createApiNotificationHandler/
        )
      })

      it('should not show success notification for uploadAttachment', () => {
        expect(fileContent).toMatch(
          /uploadAttachment[\s\S]*?displayNotificationOnSuccess:\s*false/
        )
      })

      it('should use correct error i18n keys for uploadAttachment', () => {
        expect(fileContent).toContain('attachment_upload.error.title.string')
        expect(fileContent).toContain('attachment_upload.error.message.string')
      })
    })

    describe('deleteAttachment endpoint', () => {
      it('should define deleteAttachment mutation', () => {
        expect(fileContent).toContain('deleteAttachment: builder.mutation')
      })

      it('should use DELETE method', () => {
        expect(fileContent).toMatch(
          /deleteAttachment[\s\S]*?method:\s*'DELETE'/
        )
      })

      it('should use correct URL with accountId, mailKey and filename', () => {
        expect(fileContent).toContain(
          '`mailboxes/${accountId}/mail/${mailKey}/attachments/${filename}`'
        )
      })

      it('should not show success notification for deleteAttachment', () => {
        expect(fileContent).toMatch(
          /deleteAttachment[\s\S]*?displayNotificationOnSuccess:\s*false/
        )
      })

      it('should use correct error i18n keys for deleteAttachment', () => {
        expect(fileContent).toContain('attachment_delete.error.title.string')
        expect(fileContent).toContain('attachment_delete.error.message.string')
      })
    })

    describe('downloadAttachment endpoint', () => {
      it('should define downloadAttachment query', () => {
        expect(fileContent).toContain('downloadAttachment: builder.query')
      })

      it('should use GET method', () => {
        expect(fileContent).toMatch(/downloadAttachment[\s\S]*?method:\s*'GET'/)
      })

      it('should use correct URL with accountId, mailKey and filename', () => {
        expect(fileContent).toContain(
          '`mailboxes/${accountId}/mail/${mailKey}/attachments/${filename}`'
        )
      })

      it('should use a custom responseHandler to return a Blob', () => {
        expect(fileContent).toContain('responseHandler')
        expect(fileContent).toContain('response.blob()')
      })
    })

    describe('saveDraft endpoint', () => {
      // Fix broken ones:
      it('should pass displayNotificationOnError from arg', () => {
        expect(fileContent).toContain(
          'displayNotificationOnError: arg.displayNotificationOnError'
        )
      })

      it('should pass displayNotificationOnSuccess from arg', () => {
        expect(fileContent).toContain(
          'displayNotificationOnSuccess: arg.displayNotificationOnSuccess'
        )
      })
    })
  })
})
