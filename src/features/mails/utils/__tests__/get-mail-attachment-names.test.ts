import type { ImapAttachments } from '../../mails-types'
import { getMailAttachmentNames } from '../get-mail-attachment-names'

describe('getMailAttachmentNames', () => {
  describe('basic rendering', () => {
    it('returns empty array when attachments are undefined', () => {
      expect(getMailAttachmentNames(undefined)).toEqual([])
    })
  })

  describe('configuration', () => {
    it('extracts names from parts object shape', () => {
      const attachments: ImapAttachments = {
        count: 2,
        parts: [
          {
            partId: '1',
            name: 'report.pdf',
            contentType: 'application/pdf',
            size: 100,
            downloadUri: '/dl/1',
            displayUri: '/display/1',
          },
          {
            partId: '2',
            name: '  notes.txt  ',
            contentType: 'text/plain',
            size: 50,
            downloadUri: '/dl/2',
            displayUri: '/display/2',
          },
        ],
      }
      expect(getMailAttachmentNames(attachments)).toEqual([
        'report.pdf',
        'notes.txt',
      ])
    })

    it('skips parts without a name', () => {
      const attachments: ImapAttachments = {
        count: 1,
        parts: [
          {
            partId: '1',
            name: '',
            contentType: 'application/pdf',
            size: 100,
            downloadUri: '/dl/1',
            displayUri: '/display/1',
          },
        ],
      }
      expect(getMailAttachmentNames(attachments)).toEqual([])
    })

    it('extracts filenames from array shape', () => {
      const attachments = [
        {
          contentType: 'application/pdf',
          displayUri: '/display/1',
          downloadUri: '/dl/1',
          extension: 'pdf',
          filename: 'invoice.pdf',
          size: 200,
        },
        {
          contentType: 'text/plain',
          displayUri: '/display/2',
          downloadUri: '/dl/2',
          extension: 'txt',
          filename: '  readme.txt  ',
          size: 10,
        },
      ]
      expect(getMailAttachmentNames(attachments)).toEqual([
        'invoice.pdf',
        'readme.txt',
      ])
    })

    it('returns empty array when parts list is empty', () => {
      const attachments: ImapAttachments = { count: 0, parts: [] }
      expect(getMailAttachmentNames(attachments)).toEqual([])
    })
  })
})
