import type { FolderDragData, MailDragData } from '@/components/dnd/types'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  canDropMailOnFolder,
  resolveDraggedMailIds,
  resolveMailFolderDrop,
} from '../mail-folder-drop'

function mailData(overrides: Partial<MailDragData> = {}): MailDragData {
  return {
    type: 'mail',
    mailId: '1',
    accountId: '0',
    folder: 'INBOX',
    subject: 'Hello',
    from: 'Ada',
    count: 1,
    ...overrides,
  }
}

function folderData(overrides: Partial<FolderDragData> = {}): FolderDragData {
  return {
    type: 'folder',
    folderPath: 'Archive',
    folderType: 'NORMAL',
    ...overrides,
  }
}

function event(
  active: unknown,
  over: unknown
): Pick<DragEndEvent, 'active' | 'over'> {
  return {
    active: { data: { current: active } },
    over: over == null ? null : { data: { current: over } },
  } as Pick<DragEndEvent, 'active' | 'over'>
}

describe('resolveDraggedMailIds', () => {
  it('returns the whole selection when the dragged mail is selected', () => {
    expect(resolveDraggedMailIds('2', ['1', '2', '3'])).toEqual(['1', '2', '3'])
  })

  it('returns only the dragged mail when it is not selected', () => {
    expect(resolveDraggedMailIds('9', ['1', '2'])).toEqual(['9'])
  })
})

describe('resolveMailFolderDrop', () => {
  it('no-ops when the active item is not a mail', () => {
    expect(
      resolveMailFolderDrop(
        event({ type: 'contact', contactId: 'c' }, folderData()),
        []
      )
    ).toEqual({ kind: 'noop' })
  })

  it('no-ops when there is no folder target', () => {
    expect(resolveMailFolderDrop(event(mailData(), null), [])).toEqual({
      kind: 'noop',
    })
  })

  it('no-ops when dropping on the source folder', () => {
    expect(
      resolveMailFolderDrop(
        event(
          mailData(),
          folderData({ folderPath: 'INBOX', folderType: 'INBOX' })
        ),
        []
      )
    ).toEqual({ kind: 'noop' })
  })

  it('moves a single unselected mail', () => {
    expect(
      resolveMailFolderDrop(event(mailData(), folderData()), ['2', '3'])
    ).toEqual({
      kind: 'move',
      mailIds: ['1'],
      accountId: '0',
      folder: 'INBOX',
      destination: 'Archive',
    })
  })

  it('moves the full selection when the dragged mail is selected', () => {
    expect(
      resolveMailFolderDrop(event(mailData(), folderData()), ['1', '4'])
    ).toEqual({
      kind: 'move',
      mailIds: ['1', '4'],
      accountId: '0',
      folder: 'INBOX',
      destination: 'Archive',
    })
  })

  it('maps junk targets to spam', () => {
    expect(
      resolveMailFolderDrop(
        event(
          mailData(),
          folderData({ folderPath: 'Junk', folderType: 'JUNK' })
        ),
        []
      )
    ).toEqual({
      kind: 'spam',
      mailIds: ['1'],
      accountId: '0',
      folder: 'INBOX',
    })
  })

  it('maps trash targets to delete', () => {
    expect(
      resolveMailFolderDrop(
        event(
          mailData({ folderType: 'INBOX' }),
          folderData({ folderPath: 'Trash', folderType: 'TRASH' })
        ),
        []
      )
    ).toEqual({
      kind: 'delete',
      mailIds: ['1'],
      accountId: '0',
      folder: 'INBOX',
    })
  })

  it('refuses dropping received mail onto Sent', () => {
    expect(
      resolveMailFolderDrop(
        event(
          mailData({ folderType: 'INBOX' }),
          folderData({ folderPath: 'Sent', folderType: 'SENT' })
        ),
        []
      )
    ).toEqual({ kind: 'noop' })
  })

  it('refuses dropping sent mail onto Inbox', () => {
    expect(
      resolveMailFolderDrop(
        event(
          mailData({ folder: 'Sent', folderType: 'SENT' }),
          folderData({ folderPath: 'INBOX', folderType: 'INBOX' })
        ),
        []
      )
    ).toEqual({ kind: 'noop' })
  })
})

describe('canDropMailOnFolder', () => {
  it('allows inbox mail to custom folders, trash and junk', () => {
    const fromInbox = {
      sourcePath: 'INBOX',
      sourceType: 'INBOX' as const,
    }
    expect(
      canDropMailOnFolder({
        ...fromInbox,
        destPath: 'Archive',
        destType: 'NORMAL',
      })
    ).toBe(true)
    expect(
      canDropMailOnFolder({
        ...fromInbox,
        destPath: 'Trash',
        destType: 'TRASH',
      })
    ).toBe(true)
    expect(
      canDropMailOnFolder({ ...fromInbox, destPath: 'Junk', destType: 'JUNK' })
    ).toBe(true)
  })

  it('blocks inbox mail from Sent, Drafts and Templates', () => {
    const fromInbox = {
      sourcePath: 'INBOX',
      sourceType: 'INBOX' as const,
    }
    expect(
      canDropMailOnFolder({ ...fromInbox, destPath: 'Sent', destType: 'SENT' })
    ).toBe(false)
    expect(
      canDropMailOnFolder({
        ...fromInbox,
        destPath: 'Drafts',
        destType: 'DRAFT',
      })
    ).toBe(false)
    expect(
      canDropMailOnFolder({
        ...fromInbox,
        destPath: 'Templates',
        destType: 'TEMPLATE',
      })
    ).toBe(false)
  })

  it('blocks drafts from Inbox, Sent and Junk', () => {
    const fromDrafts = {
      sourcePath: 'Drafts',
      sourceType: 'DRAFT' as const,
    }
    expect(
      canDropMailOnFolder({
        ...fromDrafts,
        destPath: 'INBOX',
        destType: 'INBOX',
      })
    ).toBe(false)
    expect(
      canDropMailOnFolder({ ...fromDrafts, destPath: 'Sent', destType: 'SENT' })
    ).toBe(false)
    expect(
      canDropMailOnFolder({ ...fromDrafts, destPath: 'Junk', destType: 'JUNK' })
    ).toBe(false)
    expect(
      canDropMailOnFolder({
        ...fromDrafts,
        destPath: 'Trash',
        destType: 'TRASH',
      })
    ).toBe(true)
    expect(
      canDropMailOnFolder({
        ...fromDrafts,
        destPath: 'Archive',
        destType: 'NORMAL',
      })
    ).toBe(true)
  })

  it('allows sent mail to custom folders and trash, not inbox or junk', () => {
    const fromSent = {
      sourcePath: 'Sent',
      sourceType: 'SENT' as const,
    }
    expect(
      canDropMailOnFolder({
        ...fromSent,
        destPath: 'Archive',
        destType: 'NORMAL',
      })
    ).toBe(true)
    expect(
      canDropMailOnFolder({
        ...fromSent,
        destPath: 'Trash',
        destType: 'TRASH',
      })
    ).toBe(true)
    expect(
      canDropMailOnFolder({ ...fromSent, destPath: 'INBOX', destType: 'INBOX' })
    ).toBe(false)
    expect(
      canDropMailOnFolder({ ...fromSent, destPath: 'Junk', destType: 'JUNK' })
    ).toBe(false)
  })

  it('allows junk mail back to inbox', () => {
    expect(
      canDropMailOnFolder({
        sourcePath: 'Junk',
        sourceType: 'JUNK',
        destPath: 'INBOX',
        destType: 'INBOX',
      })
    ).toBe(true)
  })

  /**
   * Special-use roles (RFC 6154 + SOGo templates):
   * - Inbox / Junk: received mail only (incl. restore from Trash, ham from Junk)
   * - Sent / Drafts / Templates: only their own kind (compose lifecycle)
   * - Trash / NORMAL: generic filing — anything may leave into them
   */
  it('matches the IMAP special-use drop matrix', () => {
    const folders = {
      INBOX: { path: 'INBOX', type: 'INBOX' as const },
      SENT: { path: 'Sent', type: 'SENT' as const },
      DRAFT: { path: 'Drafts', type: 'DRAFT' as const },
      TRASH: { path: 'Trash', type: 'TRASH' as const },
      JUNK: { path: 'Junk', type: 'JUNK' as const },
      TEMPLATE: { path: 'Templates', type: 'TEMPLATE' as const },
      NORMAL: { path: 'Archive', type: 'NORMAL' as const },
    }
    const types = Object.keys(folders) as (keyof typeof folders)[]

    const allowed: Record<string, readonly string[]> = {
      INBOX: ['TRASH', 'JUNK', 'NORMAL'],
      SENT: ['TRASH', 'NORMAL'],
      DRAFT: ['TRASH', 'NORMAL'],
      TRASH: ['INBOX', 'JUNK', 'NORMAL'],
      JUNK: ['INBOX', 'TRASH', 'NORMAL'],
      TEMPLATE: ['TRASH', 'NORMAL'],
      NORMAL: ['INBOX', 'TRASH', 'JUNK'],
    }

    for (const source of types) {
      for (const dest of types) {
        const expected =
          source !== dest && (allowed[source]?.includes(dest) ?? false)
        expect(
          canDropMailOnFolder({
            sourcePath: folders[source].path,
            sourceType: folders[source].type,
            destPath: folders[dest].path,
            destType: folders[dest].type,
          })
        ).toBe(expected)
      }
    }

    expect(
      canDropMailOnFolder({
        sourcePath: 'Archive',
        sourceType: 'NORMAL',
        destPath: 'banane',
        destType: 'NORMAL',
      })
    ).toBe(true)
  })
})
