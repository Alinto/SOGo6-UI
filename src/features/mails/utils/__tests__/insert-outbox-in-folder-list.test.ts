import type { ImapFolder } from '../../mails-types'
import {
  insertOutboxInFolderList,
  isOutboxListSentinel,
  OUTBOX_LIST_SENTINEL,
} from '../insert-outbox-in-folder-list'

function folder(
  name: string,
  type: ImapFolder['type'],
  path = name
): ImapFolder {
  return {
    name,
    path,
    type,
    unseen_count: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    selectable: true,
    default: false,
  }
}

function names(nodes: ReturnType<typeof insertOutboxInFolderList>): string[] {
  return nodes.map((node) =>
    isOutboxListSentinel(node) ? 'outbox' : node.path
  )
}

describe('insertOutboxInFolderList', () => {
  it('inserts after Drafts when both Drafts and Sent exist', () => {
    expect(
      names(
        insertOutboxInFolderList([
          folder('INBOX', 'INBOX'),
          folder('Sent', 'SENT'),
          folder('Drafts', 'DRAFT'),
        ])
      )
    ).toEqual(['INBOX', 'Sent', 'Drafts', 'outbox'])
  })

  it('inserts after DRAFTS alias', () => {
    expect(
      names(
        insertOutboxInFolderList([
          folder('INBOX', 'INBOX'),
          folder('Drafts', 'DRAFTS'),
          folder('Sent', 'SENT'),
        ])
      )
    ).toEqual(['INBOX', 'Drafts', 'outbox', 'Sent'])
  })

  it('inserts before Sent when Drafts is missing', () => {
    expect(
      names(
        insertOutboxInFolderList([
          folder('INBOX', 'INBOX'),
          folder('Sent', 'SENT'),
          folder('Work', 'NORMAL'),
        ])
      )
    ).toEqual(['INBOX', 'outbox', 'Sent', 'Work'])
  })

  it('appends when neither Drafts nor Sent exist', () => {
    expect(
      names(
        insertOutboxInFolderList([
          folder('INBOX', 'INBOX'),
          folder('Work', 'NORMAL'),
        ])
      )
    ).toEqual(['INBOX', 'Work', 'outbox'])
  })

  it('exports a stable sentinel', () => {
    expect(OUTBOX_LIST_SENTINEL).toEqual({ kind: 'outbox' })
  })
})
