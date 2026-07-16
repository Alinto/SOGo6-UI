import type { ImapFolder } from '../../mails-types'
import { FOLDER_RENAME_API_ENABLED } from '../can-rename-folder'
import { getFolderActions } from '../folder-actions'

const describeWhenRenameApiEnabled = FOLDER_RENAME_API_ENABLED
  ? describe
  : describe.skip

const baseFolder = (
  overrides: Partial<ImapFolder> = {}
): Pick<ImapFolder, 'type' | 'selectable' | 'default'> => ({
  type: 'NORMAL',
  selectable: true,
  default: false,
  ...overrides,
})

describe('getFolderActions', () => {
  it('returns only delete for virtual folders', () => {
    const actions = getFolderActions(
      baseFolder({ selectable: false, type: 'NORMAL' })
    )
    expect(actions.map((action) => action.id)).toEqual(['delete'])
  })

  it('includes common actions for selectable folders', () => {
    const actions = getFolderActions(baseFolder({ type: 'INBOX' }))
    expect(actions.map((action) => action.id)).toEqual([
      'mark_as_read',
      'new_subfolder',
      'sharing',
      'export',
      'expunge',
    ])
  })

  it('adds empty_folder for trash and junk', () => {
    const trashActions = getFolderActions(baseFolder({ type: 'TRASH' }))
    expect(trashActions.some((action) => action.id === 'empty_folder')).toBe(
      true
    )
  })

  it('adds normal-only actions for NORMAL folders', () => {
    const actions = getFolderActions(baseFolder({ type: 'NORMAL' }))
    const expected = [
      'mark_as_read',
      'new_subfolder',
      'sharing',
      'export',
      'expunge',
      ...(FOLDER_RENAME_API_ENABLED ? (['rename'] as const) : []),
      'move_to',
      'set_as',
      'delete',
    ]
    expect(actions.map((action) => action.id)).toEqual(expected)
  })

  describeWhenRenameApiEnabled('rename action', () => {
    it('includes rename for NORMAL folders when API is enabled', () => {
      const actions = getFolderActions(baseFolder({ type: 'NORMAL' }))
      expect(actions.some((action) => action.id === 'rename')).toBe(true)
    })
  })

  it('disables backend-blocked actions', () => {
    const actions = getFolderActions(baseFolder({ type: 'NORMAL' }))
    const blocked = actions.filter((action) => action.disabled)
    expect(blocked.map((action) => action.id)).toEqual([
      'mark_as_read',
      'export',
      'move_to',
      'set_as',
    ])
  })
})
