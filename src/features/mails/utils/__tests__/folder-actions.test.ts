import type { ImapFolder } from '../../mails-types'
import { FOLDER_RENAME_API_ENABLED } from '../can-rename-folder'
import { getFolderActions } from '../folder-actions'

const describeWhenRenameApiEnabled = FOLDER_RENAME_API_ENABLED
  ? describe
  : describe.skip

const baseFolder = (
  overrides: Partial<ImapFolder> = {}
): Pick<ImapFolder, 'type' | 'selectable' | 'default' | 'rights'> => ({
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

  it('hides sharing when mail sharing is disabled', () => {
    const actions = getFolderActions(baseFolder({ type: 'INBOX' }), {
      folderSharingDisabled: ['mail'],
    })
    expect(actions.some((action) => action.id === 'sharing')).toBe(false)
    expect(actions.some((action) => action.id === 'export')).toBe(true)
  })

  it('hides export when mail export is disabled', () => {
    const actions = getFolderActions(baseFolder({ type: 'INBOX' }), {
      folderExportDisabled: true,
    })
    expect(actions.some((action) => action.id === 'export')).toBe(false)
    expect(actions.some((action) => action.id === 'sharing')).toBe(true)
  })

  describe('folder rights', () => {
    const disabledIds = (folder: ReturnType<typeof baseFolder>) =>
      getFolderActions(folder, { mailPurgeAllow: true })
        .filter((action) => action.disabled)
        .map((action) => action.id)

    it('does not restrict folders without rights', () => {
      expect(disabledIds(baseFolder({ type: 'NORMAL' }))).toEqual([
        'mark_as_read',
        'export',
        'move_to',
        'set_as',
      ])
    })

    it('disables every right-gated action for a read-only folder', () => {
      const actions = getFolderActions(
        baseFolder({
          type: 'NORMAL',
          rights: { userCanViewFolder: 1, userCanReadMails: 1 },
        }),
        { mailPurgeAllow: true }
      )
      const byId = Object.fromEntries(
        actions.map((action) => [action.id, action])
      )
      for (const id of ['new_subfolder', 'sharing', 'purge', 'expunge']) {
        expect(byId[id].disabled).toBe(true)
        expect(byId[id].disabledReasonKey).toBe(
          'folders.actions.permission_denied.string'
        )
      }
      expect(byId.delete.disabled).toBe(true)
      expect(byId.export.disabledReasonKey).toBe(
        'folders.actions.action_unavailable.string'
      )
    })

    it('enables sharing only with the administer right', () => {
      const sharing = (rights: ImapFolder['rights']) =>
        getFolderActions(baseFolder({ type: 'INBOX', rights })).find(
          (action) => action.id === 'sharing'
        )
      expect(sharing({ userIsAdministrator: 1 })?.disabled).toBeFalsy()
      expect(sharing({ userCanReadMails: 1 })?.disabled).toBe(true)
    })

    it('needs t and e to empty trash', () => {
      const emptyAction = (rights: ImapFolder['rights']) =>
        getFolderActions(baseFolder({ type: 'TRASH', rights })).find(
          (action) => action.id === 'empty_folder'
        )
      expect(emptyAction({ userCanEraseMails: 1 })?.disabled).toBe(true)
      expect(
        emptyAction({ userCanEraseMails: 1, userCanExpungeFolder: 1 })?.disabled
      ).toBeFalsy()
    })

    it('does not restrict the delete action of virtual folders', () => {
      const actions = getFolderActions(
        baseFolder({ selectable: false, rights: {} })
      )
      expect(actions).toHaveLength(1)
      expect(actions[0].disabled).toBeFalsy()
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
