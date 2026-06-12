import {
  folderPathFromParams,
  getFolderDisplayName,
} from '../folder-path-from-params'

describe('folderPathFromParams', () => {
  it('decodes encoded subfolder paths', () => {
    expect(folderPathFromParams('INBOX%2Fnewsub')).toBe('INBOX/newsub')
  })

  it('joins array segments', () => {
    expect(folderPathFromParams(['Archive', 'Old'])).toBe('Archive/Old')
  })

  it('returns empty string when folder is undefined', () => {
    expect(folderPathFromParams(undefined)).toBe('')
  })
})

describe('getFolderDisplayName', () => {
  const t = (key: string) => `translated:${key}`

  it('translates system folders', () => {
    expect(getFolderDisplayName('INBOX', t)).toBe('translated:folders.inbox.string')
  })

  it('shows leaf name for subfolders', () => {
    expect(getFolderDisplayName('INBOX/newsub', t)).toBe('newsub')
  })

  it('shows custom top-level folder name as-is', () => {
    expect(getFolderDisplayName('My Projects', t)).toBe('My Projects')
  })
})
