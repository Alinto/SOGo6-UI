import type { ImapFolder } from '../../mails-types'
import {
  collapseBreadcrumb,
  getFittingLevelCount,
  getFolderBreadcrumb,
} from '../get-folder-breadcrumb'

const folder = (
  path: string,
  subfolders?: ImapFolder[],
  extra: Partial<ImapFolder> = {}
): ImapFolder => ({
  name: path.split('/').pop() ?? path,
  path,
  unseen_count: 0,
  messages: 0,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
  subfolders,
  ...extra,
})

const tree: ImapFolder[] = [
  folder('INBOX', [
    folder('INBOX/tutu', [folder('INBOX/tutu/deep')]),
    folder('INBOX/other'),
  ]),
  folder('Shared', [folder('Shared/Contrib')], { selectable: false }),
]

const paths = (chain: ImapFolder[]) => chain.map((f) => f.path)

describe('getFolderBreadcrumb', () => {
  it('returns a single item for a root folder', () => {
    expect(paths(getFolderBreadcrumb(tree, 'INBOX'))).toEqual(['INBOX'])
  })

  it('returns the parents of a subfolder', () => {
    expect(paths(getFolderBreadcrumb(tree, 'INBOX/tutu'))).toEqual([
      'INBOX',
      'INBOX/tutu',
    ])
  })

  it('handles several levels', () => {
    expect(paths(getFolderBreadcrumb(tree, 'INBOX/tutu/deep'))).toEqual([
      'INBOX',
      'INBOX/tutu',
      'INBOX/tutu/deep',
    ])
  })

  it('keeps non-selectable parents', () => {
    const chain = getFolderBreadcrumb(tree, 'Shared/Contrib')
    expect(paths(chain)).toEqual(['Shared', 'Shared/Contrib'])
    expect(chain[0]?.selectable).toBe(false)
  })

  it('ignores case', () => {
    expect(paths(getFolderBreadcrumb(tree, 'inbox/TUTU'))).toEqual([
      'INBOX',
      'INBOX/tutu',
    ])
  })

  it('reads children when subfolders is missing', () => {
    const alt = [{ ...folder('A'), children: [folder('A/b')] }]
    expect(paths(getFolderBreadcrumb(alt, 'A/b'))).toEqual(['A', 'A/b'])
  })

  it('returns an empty list for an unknown or empty path', () => {
    expect(getFolderBreadcrumb(tree, 'Nope')).toEqual([])
    expect(getFolderBreadcrumb(tree, '')).toEqual([])
  })
})

describe('collapseBreadcrumb', () => {
  it('keeps the chain as is when it fits', () => {
    expect(collapseBreadcrumb(['a', 'b', 'c', 'd', 'e'])).toEqual({
      leading: ['a', 'b', 'c', 'd', 'e'],
      hidden: [],
      trailing: [],
    })
  })

  it('keeps the first and the last four items of a longer chain', () => {
    expect(collapseBreadcrumb(['a', 'b', 'c', 'd', 'e', 'f', 'g'])).toEqual({
      leading: ['a'],
      hidden: ['b', 'c'],
      trailing: ['d', 'e', 'f', 'g'],
    })
  })

  it('honours a custom maximum', () => {
    expect(collapseBreadcrumb(['a', 'b', 'c', 'd'], 3)).toEqual({
      leading: ['a'],
      hidden: ['b'],
      trailing: ['c', 'd'],
    })
  })

  it('keeps at least the first and the last item', () => {
    expect(collapseBreadcrumb(['a', 'b', 'c', 'd'], 2)).toEqual({
      leading: ['a'],
      hidden: ['b', 'c'],
      trailing: ['d'],
    })
  })
})

describe('getFittingLevelCount', () => {
  // 7 folders of 100px, "…" of 40px.
  const fit = (availableWidth: number, count = 7, max?: number) =>
    getFittingLevelCount({
      itemWidths: Array<number>(count).fill(100),
      ellipsisWidth: 40,
      availableWidth,
      max,
    })

  it('shows every folder when they all fit', () => {
    expect(fit(500, 5)).toBe(5)
    expect(fit(300, 3)).toBe(3)
  })

  it('never shows more than the maximum', () => {
    expect(fit(10_000)).toBe(5)
    expect(fit(10_000, 7, 3)).toBe(3)
  })

  it('collapses when the folders fit in count but not in width', () => {
    // 4 × 100 > 350: first + "…" + 2 last = 340.
    expect(fit(350, 4)).toBe(3)
  })

  it('shows as many last folders as the width allows', () => {
    // first + "…" + (k - 1) × 100
    expect(fit(440)).toBe(4)
    expect(fit(439)).toBe(3)
    expect(fit(340)).toBe(3)
    expect(fit(240)).toBe(2)
  })

  it('keeps the first and the current folder when nothing fits', () => {
    expect(fit(50)).toBe(2)
    expect(fit(50, 2)).toBe(2)
    expect(fit(50, 1)).toBe(1)
  })
})
