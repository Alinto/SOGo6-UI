import type { ImapFolder } from '../../mails-types'
import {
  ARCHIVE_FOLDER_FALLBACK,
  findArchiveFolderPath,
} from '../find-archive-folder-path'

const makeFolder = (
  name: string,
  path: string,
  subfolders?: ImapFolder[]
): ImapFolder => ({
  name,
  path,
  unseen_count: 0,
  messages: 0,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
  subfolders,
})

describe('findArchiveFolderPath', () => {
  describe('basic rendering', () => {
    it('returns null for empty or undefined folders', () => {
      expect(findArchiveFolderPath(undefined)).toBeNull()
      expect(findArchiveFolderPath([])).toBeNull()
    })
  })

  describe('configuration', () => {
    it('finds top-level archive folder case-insensitively', () => {
      const folders = [makeFolder('Archive', 'Archive')]
      expect(findArchiveFolderPath(folders)).toBe('Archive')
    })

    it('finds nested archive folder via subfolders', () => {
      const folders = [
        makeFolder('INBOX', 'INBOX', [
          makeFolder('archive', 'INBOX/archive'),
        ]),
      ]
      expect(findArchiveFolderPath(folders)).toBe('INBOX/archive')
    })

    it('finds nested archive folder via children', () => {
      const parent = makeFolder('Work', 'Work')
      parent.children = [makeFolder('Archive', 'Work/Archive')]
      expect(findArchiveFolderPath([parent])).toBe('Work/Archive')
    })

    it('returns null when no archive folder exists', () => {
      const folders = [makeFolder('INBOX', 'INBOX')]
      expect(findArchiveFolderPath(folders)).toBeNull()
    })
  })
})

describe('ARCHIVE_FOLDER_FALLBACK', () => {
  it('exports the default archive folder name', () => {
    expect(ARCHIVE_FOLDER_FALLBACK).toBe('Archive')
  })
})
