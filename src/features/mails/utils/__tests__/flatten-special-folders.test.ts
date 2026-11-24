import type { ImapFolder } from '../../mails-types'
import { flattenSpecialFolders } from '../flatten-special-folders'

const folder = (
  path: string,
  type: ImapFolder['type'],
  nested?: { subfolders?: ImapFolder[]; children?: ImapFolder[] }
): ImapFolder => ({
  name: path.split('/').pop() ?? path,
  path,
  type,
  unseen_count: 0,
  messages: 0,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
  ...nested,
})

const paths = (folders: ImapFolder[]) => folders.map((f) => f.path)

describe('flattenSpecialFolders', () => {
  it('returns an empty list for no folders', () => {
    expect(flattenSpecialFolders([])).toEqual([])
  })

  it('leaves out NORMAL and untyped folders', () => {
    const result = flattenSpecialFolders([
      folder('INBOX', 'INBOX'),
      folder('Work', 'NORMAL'),
      folder('NoType', undefined),
    ])
    expect(paths(result)).toEqual(['INBOX'])
  })

  it('brings nested special folders up to the same level as their parent', () => {
    const result = flattenSpecialFolders([
      folder('INBOX', 'INBOX', {
        subfolders: [
          folder('INBOX/Trash', 'TRASH'),
          folder('INBOX/Clients', 'NORMAL', {
            subfolders: [folder('INBOX/Clients/Junk', 'JUNK')],
          }),
        ],
      }),
    ])
    expect(paths(result)).toEqual([
      'INBOX',
      'INBOX/Trash',
      'INBOX/Clients/Junk',
    ])
  })

  it('reads nested folders from children when subfolders is missing', () => {
    const result = flattenSpecialFolders([
      folder('Root', 'NORMAL', { children: [folder('Root/Sent', 'SENT')] }),
    ])
    expect(paths(result)).toEqual(['Root/Sent'])
  })

  it('orders folders by type, whatever their depth', () => {
    const result = flattenSpecialFolders([
      folder('Templates', 'TEMPLATE'),
      folder('Junk', 'JUNK'),
      folder('INBOX', 'INBOX', {
        subfolders: [
          folder('INBOX/Trash', 'TRASH'),
          folder('INBOX/Drafts', 'DRAFTS'),
          folder('INBOX/Sent', 'SENT'),
        ],
      }),
    ])
    expect(paths(result)).toEqual([
      'INBOX',
      'INBOX/Sent',
      'INBOX/Drafts',
      'INBOX/Trash',
      'Junk',
      'Templates',
    ])
  })

  it('does not mutate the input tree', () => {
    const tree = [folder('Junk', 'JUNK'), folder('INBOX', 'INBOX')]
    flattenSpecialFolders(tree)
    expect(paths(tree)).toEqual(['Junk', 'INBOX'])
  })
})
