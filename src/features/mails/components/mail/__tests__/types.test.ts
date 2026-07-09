import React from 'react'
import {
  ActionId,
  type Action,
  type AttachmentNameProps,
  type EmailContact,
  type ImapAttachmentPart,
  type ImapAttachments,
  type MailActionsBarProps,
  type MailAttachmentProps,
  type MailContentProps,
  type MailHeaderFullProps,
  type MailHeaderProps,
  type MailReturnButtonProps,
  type MailShowImageProps,
  type MailSubjectProps,
  type RightActionsType,
  type UnsubscribeDialogProps,
} from '../types'

describe('Mail Types', () => {
  it('should have GO_BACK action type', () => {
    expect(ActionId.GO_BACK).toBe('go-back')
  })

  it('should have GO_NEXT action type', () => {
    expect(ActionId.GO_NEXT).toBe('go-next')
  })

  it('should define all mail action bar action ids', () => {
    expect(ActionId).toEqual({
      GO_BACK: 'go-back',
      GO_NEXT: 'go-next',
      DELETE: 'delete',
      SPAM: 'spam',
      HAM: 'ham',
      MARK_UNREAD: 'mark-unread',
      LABEL: 'label',
      MORE: 'more',
      ARCHIVE: 'archive',
      DOWNLOAD: 'download',
      MOVE: 'move',
      PRINT: 'print',
      VIEW_SOURCE: 'view-source',
      REPLY: 'reply',
      REPLY_ALL: 'reply-all',
      FORWARD: 'forward',
      EDIT_DRAFT: 'edit-draft',
      USE_TEMPLATE: 'use-template',
    })
  })

  it('should have exactly 18 action types', () => {
    expect(Object.keys(ActionId)).toHaveLength(18)
  })

  describe('Type definitions', () => {
    it('should allow MailSubjectProps to be defined', () => {
      const subject: MailSubjectProps = { subject: 'Test Subject' }
      expect(subject.subject).toBe('Test Subject')
    })

    it('should allow Action to be defined with required fields', () => {
      const action: Action = {
        id: 'test-id',
        icon: React.createElement('div'),
      }
      expect(action.id).toBe('test-id')
      expect(action.icon).toBeDefined()
    })

    it('should allow Action with optional title', () => {
      const action: Action = {
        id: 'test-id',
        icon: React.createElement('span'),
        title: 'Test Title',
      }
      expect(action.title).toBe('Test Title')
    })

    it('should allow MailActionsBarProps to be defined', () => {
      const props: MailActionsBarProps = {
        actions: [
          {
            id: 'action-1',
            icon: React.createElement('button'),
          },
        ],
        className: 'custom-class',
        onAction: jest.fn(),
      }
      expect(props.actions).toHaveLength(1)
      expect(props.className).toBe('custom-class')
      expect(props.onAction).toBeDefined()
    })

    it('should allow MailReturnButtonProps to be defined', () => {
      const props: MailReturnButtonProps = {
        folderPath: 'INBOX',
        tooltip: 'Go back',
        className: 'btn-class',
      }
      expect(props.folderPath).toBe('INBOX')
      expect(props.tooltip).toBe('Go back')
      expect(props.className).toBe('btn-class')
    })

    it('should allow EmailContact to be defined with required email', () => {
      const contact: EmailContact = {
        email: 'test@example.com',
      }
      expect(contact.email).toBe('test@example.com')
    })

    it('should allow EmailContact with optional name', () => {
      const contact: EmailContact = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      expect(contact.name).toBe('John Doe')
      expect(contact.email).toBe('john@example.com')
    })

    it('should allow MailHeaderProps to be defined', () => {
      const props: MailHeaderProps = {
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'recipient@example.com', name: 'Recipient' }],
        cc: [{ email: 'cc@example.com' }],
        showUnsubscribeButton: true,
      }
      expect(props.from.email).toBe('sender@example.com')
      expect(props.to).toHaveLength(1)
      expect(props.cc).toHaveLength(1)
      expect(props.showUnsubscribeButton).toBe(true)
    })

    it('should allow UnsubscribeDialogProps to be defined', () => {
      const props: UnsubscribeDialogProps = {
        open: true,
        onOpenChange: jest.fn(),
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
      }
      expect(props.open).toBe(true)
      expect(props.onOpenChange).toBeDefined()
      expect(props.senderName).toBe('John Doe')
      expect(props.senderEmail).toBe('john@example.com')
    })

    it('should allow RightActionsType to be defined as array', () => {
      const actions: RightActionsType = [
        {
          icon: React.createElement('i'),
          title: 'Action 1',
        },
      ]
      expect(actions).toHaveLength(1)
      expect(actions[0].title).toBe('Action 1')
    })

    it('should allow MailHeaderFullProps to extend MailHeaderProps', () => {
      const props: MailHeaderFullProps = {
        from: { email: 'sender@example.com' },
        to: [{ email: 'recipient@example.com' }],
        date: Date.now(),
      }
      expect(props.date).toBeGreaterThan(0)
    })

    it('should allow ImapAttachmentPart to be defined', () => {
      const attachment: ImapAttachmentPart = {
        partId: 'part-1',
        name: 'document.pdf',
        contentType: 'application/pdf',
        size: 1024,
        downloadUri: 'https://example.com/download/1',
        displayUri: 'https://example.com/display/1',
      }
      expect(attachment.name).toBe('document.pdf')
      expect(attachment.size).toBe(1024)
      expect(attachment.contentType).toBe('application/pdf')
    })

    it('should allow AttachmentNameProps to be defined', () => {
      const props: AttachmentNameProps = {
        name: 'file.txt',
        maxLength: 50,
        className: 'attachment-name',
      }
      expect(props.name).toBe('file.txt')
      expect(props.maxLength).toBe(50)
      expect(props.className).toBe('attachment-name')
    })

    it('should allow MailAttachmentProps to be defined', () => {
      const props: MailAttachmentProps = {
        part: {
          partId: 'part-1',
          name: 'image.jpg',
          contentType: 'image/jpeg',
          size: 2048,
          downloadUri: 'https://example.com/download/1',
          displayUri: 'https://example.com/display/1',
        },
        className: 'attachment',
      }
      expect(props.part.name).toBe('image.jpg')
      expect(props.className).toBe('attachment')
    })

    it('should allow ImapAttachments to be defined', () => {
      const attachments: ImapAttachments = {
        parts: [
          {
            partId: 'part-1',
            name: 'file1.txt',
            contentType: 'text/plain',
            size: 512,
            downloadUri: 'https://example.com/download/1',
            displayUri: 'https://example.com/display/1',
          },
        ],
        zipUri: 'https://example.com/download/all.zip',
        count: 1,
      }
      expect(attachments.parts).toHaveLength(1)
      expect(attachments.count).toBe(1)
      expect(attachments.zipUri).toBe('https://example.com/download/all.zip')
    })

    it('should allow MailContentProps to be defined', () => {
      const props: MailContentProps = {
        body: '<p>Hello, World!</p>',
        attachments: {
          count: 0,
        },
      }
      expect(props.body).toContain('Hello, World!')
      expect(props.attachments?.count).toBe(0)
    })

    it('should allow MailShowImageProps to be defined', () => {
      const props: MailShowImageProps = {
        onShowImages: jest.fn(),
      }
      expect(props.onShowImages).toBeDefined()
    })
  })

  describe('Type compatibility', () => {
    it('should allow Action with JSX.Element as icon', () => {
      const action: Action = {
        id: 'test',
        icon: React.createElement('svg'),
      }
      expect(action.icon).toBeDefined()
    })

    it('should allow optional fields in EmailContact', () => {
      const contactWithoutName: EmailContact = {
        email: 'user@example.com',
      }
      expect(contactWithoutName.name).toBeUndefined()
    })

    it('should allow MailHeaderProps without optional cc field', () => {
      const props: MailHeaderProps = {
        from: { email: 'sender@example.com' },
        to: [{ email: 'recipient@example.com' }],
      }
      expect(props.cc).toBeUndefined()
    })

    it('should allow ImapAttachments without parts field', () => {
      const attachments: ImapAttachments = {
        count: 0,
      }
      expect(attachments.parts).toBeUndefined()
      expect(attachments.count).toBe(0)
    })
  })
})
