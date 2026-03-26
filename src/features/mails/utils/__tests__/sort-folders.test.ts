import '@testing-library/jest-dom'

import type { ImapFolder } from '@/features/mails/mails-types'
import {
  FOLDER_TYPE_ORDER,
  getFolderSortRank,
  sortImapFoldersTree,
} from '@/features/mails/utils/sort-folders'

function make(overrides: Partial<ImapFolder> & { name: string }): ImapFolder {
  return {
    path: overrides.path ?? overrides.name,
    unseen: 0,
    messages: 0,
    flags: [],
    delimiter: '/',
    readOnly: false,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('FOLDER_TYPE_ORDER', () => {
  describe('configuration', () => {
    it('uses uppercase keys and the expected rank ladder', () => {
      expect(FOLDER_TYPE_ORDER).toMatchObject({
        INBOX: 0,
        SENT: 1,
        DRAFT: 2,
        DRAFTS: 2,
        TRASH: 3,
        JUNK: 4,
        TEMPLATE: 5,
        NORMAL: 6,
      })
    })

    it('gives DRAFT and DRAFTS the same numeric rank', () => {
      expect(FOLDER_TYPE_ORDER.DRAFT).toBe(FOLDER_TYPE_ORDER.DRAFTS)
    })
  })
})

describe('getFolderSortRank', () => {
  describe('known types', () => {
    it.each([
      ['INBOX', 0],
      ['SENT', 1],
      ['DRAFT', 2],
      ['DRAFTS', 2],
      ['TRASH', 3],
      ['JUNK', 4],
      ['TEMPLATE', 5],
      ['NORMAL', 6],
    ] as const)('maps %s to rank %i', (type, rank) => {
      expect(getFolderSortRank(type)).toBe(rank)
    })
  })

  describe('fallback (NORMAL / rank 6)', () => {
    it('returns 6 for undefined, empty string, and unknown labels', () => {
      expect(getFolderSortRank(undefined)).toBe(6)
      expect(getFolderSortRank('')).toBe(6)
      expect(getFolderSortRank('CUSTOM')).toBe(6)
      expect(getFolderSortRank('NOT_A_FOLDER_TYPE')).toBe(6)
    })
  })

  describe('case insensitivity', () => {
    it('normalizes casing before lookup', () => {
      expect(getFolderSortRank('inbox')).toBe(0)
      expect(getFolderSortRank('InBoX')).toBe(0)
      expect(getFolderSortRank('Sent')).toBe(1)
      expect(getFolderSortRank('trash')).toBe(3)
      expect(getFolderSortRank('junk')).toBe(4)
      expect(getFolderSortRank('template')).toBe(5)
      expect(getFolderSortRank('normal')).toBe(6)
    })
  })

  describe('DRAFT / DRAFTS alias', () => {
    it('produces identical ranks for DRAFT and DRAFTS', () => {
      expect(getFolderSortRank('DRAFT')).toBe(getFolderSortRank('DRAFTS'))
      expect(getFolderSortRank('draft')).toBe(getFolderSortRank('drafts'))
    })
  })
})

describe('sortImapFoldersTree', () => {
  describe('ordering by folder type', () => {
    it('orders INBOX → SENT → DRAFT → TRASH → JUNK → TEMPLATE → NORMAL', () => {
      const sorted = sortImapFoldersTree([
        make({ name: 'N', type: 'NORMAL' }),
        make({ name: 'T', type: 'TEMPLATE' }),
        make({ name: 'J', type: 'JUNK' }),
        make({ name: 'X', type: 'TRASH' }),
        make({ name: 'D', type: 'DRAFT' }),
        make({ name: 'S', type: 'SENT' }),
        make({ name: 'I', type: 'INBOX' }),
      ])
      expect(sorted.map((f) => f.type)).toEqual([
        'INBOX',
        'SENT',
        'DRAFT',
        'TRASH',
        'JUNK',
        'TEMPLATE',
        'NORMAL',
      ])
    })
  })

  describe('tie-breaker by name (localeCompare)', () => {
    it('sorts NORMAL folders alphabetically among themselves', () => {
      const sorted = sortImapFoldersTree([
        make({ name: 'Zebra', type: 'NORMAL' }),
        make({ name: 'Alpha', type: 'NORMAL' }),
        make({ name: 'Mike', type: 'NORMAL' }),
      ])
      expect(sorted.map((f) => f.name)).toEqual(['Alpha', 'Mike', 'Zebra'])
    })

    it('sorts by name when DRAFT and DRAFTS share the same rank', () => {
      const sorted = sortImapFoldersTree([
        make({ name: 'Z', type: 'DRAFTS' }),
        make({ name: 'A', type: 'DRAFT' }),
      ])
      expect(sorted.map((f) => f.name)).toEqual(['A', 'Z'])
    })

    it('orders typed and untyped NORMAL-equivalent folders by name together', () => {
      const sorted = sortImapFoldersTree([
        make({ name: 'Z' }),
        make({ name: 'A', type: 'NORMAL' }),
        make({ name: 'M' }),
      ])
      expect(sorted.map((f) => f.name)).toEqual(['A', 'M', 'Z'])
    })
  })

  describe('recursion', () => {
    it('sorts nested children and assigns them to subfolders', () => {
      const tree = sortImapFoldersTree([
        make({
          name: 'Parent',
          type: 'NORMAL',
          children: [
            make({ name: 'ChildN', type: 'NORMAL' }),
            make({ name: 'ChildI', type: 'INBOX' }),
          ],
        }),
      ])
      expect(tree[0].subfolders?.map((c) => c.name)).toEqual([
        'ChildI',
        'ChildN',
      ])
    })

    it('sorts multiple levels deep', () => {
      const tree = sortImapFoldersTree([
        make({
          name: 'Root',
          type: 'INBOX',
          children: [
            make({
              name: 'Mid',
              type: 'NORMAL',
              children: [
                make({ name: 'DeepB', type: 'NORMAL' }),
                make({ name: 'DeepA', type: 'NORMAL' }),
              ],
            }),
          ],
        }),
      ])
      expect(tree[0].subfolders?.[0].subfolders?.map((d) => d.name)).toEqual([
        'DeepA',
        'DeepB',
      ])
    })
  })

  describe('immutability', () => {
    it('does not mutate the input array order or elements', () => {
      const a = make({ name: 'B', type: 'NORMAL' })
      const b = make({ name: 'A', type: 'NORMAL' })
      const input = [a, b]
      const snapshot = input.map((f) => ({ ...f }))
      sortImapFoldersTree(input)
      expect(input).toHaveLength(2)
      expect(input[0].name).toBe(snapshot[0].name)
      expect(input[1].name).toBe(snapshot[1].name)
    })

    it('returns a new top-level array instance', () => {
      const input = [make({ name: 'A', type: 'INBOX' })]
      const out = sortImapFoldersTree(input)
      expect(out).not.toBe(input)
    })
  })

  describe('child source: children vs subfolders', () => {
    it('prefers non-empty children over subfolders', () => {
      const sorted = sortImapFoldersTree([
        make({
          name: 'P',
          type: 'NORMAL',
          children: [make({ name: 'FromChildren', type: 'INBOX' })],
          subfolders: [make({ name: 'Ignored', type: 'SENT' })],
        }),
      ])
      expect(sorted[0].subfolders).toHaveLength(1)
      expect(sorted[0].subfolders?.[0].name).toBe('FromChildren')
    })

    it('uses subfolders when children is empty', () => {
      const sorted = sortImapFoldersTree([
        make({
          name: 'P',
          type: 'NORMAL',
          children: [],
          subfolders: [make({ name: 'Sub', type: 'SENT' })],
        }),
      ])
      expect(sorted[0].subfolders?.[0].name).toBe('Sub')
    })

    it('uses subfolders when children is undefined', () => {
      const sorted = sortImapFoldersTree([
        make({
          name: 'P',
          type: 'NORMAL',
          subfolders: [make({ name: 'OnlySub', type: 'JUNK' })],
        }),
      ])
      expect(sorted[0].subfolders?.[0].name).toBe('OnlySub')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      expect(sortImapFoldersTree([])).toEqual([])
    })

    it('preserves unrelated folder fields on the output', () => {
      const folder = make({
        name: 'Inbox',
        type: 'INBOX',
        path: 'mail/INBOX',
        unseen: 3,
        messages: 10,
        flags: ['\\HasNoChildren'],
        default: true,
      })
      const [out] = sortImapFoldersTree([folder])
      expect(out.path).toBe('mail/INBOX')
      expect(out.unseen).toBe(3)
      expect(out.messages).toBe(10)
      expect(out.flags).toEqual(['\\HasNoChildren'])
      expect(out.default).toBe(true)
    })

    it('sets subfolders to empty array when there are no children', () => {
      const [out] = sortImapFoldersTree([make({ name: 'Leaf', type: 'INBOX' })])
      expect(out.subfolders).toEqual([])
    })
  })
})
