import type { FolderShareRights, SimplifiedPermissionKey } from '../mails-types'

/**
 * Sentinel `uid` for the "any authenticated user" pseudo-entry in a folder's
 * share list — not a real account, just a marker the UI/API layers use to
 * recognize it (e.g. to always sort/display this row last).
 */
export const ANY_AUTHENTICATED_UID = 'anyauthenticated'

export interface SimplifiedPermissionDef {
  key: SimplifiedPermissionKey
  labelKey: string
  detailKey: string
  fields: (keyof FolderShareRights)[]
}

// administerSubfolders maps to `userCanCreateSubfolders` (IMAP `k`, create)
// and `userCanRemoveFolder` (IMAP `x`, delete — RFC 4314 §4: `x` is checked
// on the subfolder being deleted itself). Together with `read` (l,r, always
// required to even see/select a subfolder) this covers create + read +
// delete; only renaming a subfolder isn't its own dedicated right, but a
// RENAME requires exactly `x` (old name) + `k` (new parent) — both already
// granted by this permission.
export const SIMPLIFIED_PERMISSIONS: SimplifiedPermissionDef[] = [
  {
    key: 'read',
    labelKey: 'folders.actions.sharing.simplified.read.label.string',
    detailKey: 'folders.actions.sharing.simplified.read.detail.string',
    fields: ['userCanViewFolder', 'userCanReadMails'],
  },
  {
    key: 'modify',
    labelKey: 'folders.actions.sharing.simplified.modify.label.string',
    detailKey: 'folders.actions.sharing.simplified.modify.detail.string',
    fields: ['userCanMarkMailsRead', 'userCanWriteMails'],
  },
  {
    key: 'delete',
    labelKey: 'folders.actions.sharing.simplified.delete.label.string',
    detailKey: 'folders.actions.sharing.simplified.delete.detail.string',
    fields: ['userCanEraseMails', 'userCanExpungeFolder'],
  },
  {
    key: 'move',
    labelKey: 'folders.actions.sharing.simplified.move.label.string',
    detailKey: 'folders.actions.sharing.simplified.move.detail.string',
    fields: ['userCanInsertMails'],
  },
  {
    key: 'administerRights',
    labelKey: 'folders.actions.sharing.simplified.administerRights.label.string',
    detailKey: 'folders.actions.sharing.simplified.administerRights.detail.string',
    fields: ['userIsAdministrator'],
  },
  {
    key: 'administerSubfolders',
    labelKey:
      'folders.actions.sharing.simplified.administerSubfolders.label.string',
    detailKey:
      'folders.actions.sharing.simplified.administerSubfolders.detail.string',
    fields: ['userCanCreateSubfolders', 'userCanRemoveFolder'],
  },
]

/**
 * Standing order for the 4 "chained" simplified permissions: checking one
 * forces every earlier key in this list to be checked too. `administerRights`
 * and `administerSubfolders` are intentionally excluded — they're independent
 * standalone toggles, not part of this chain.
 */
export const SIMPLIFIED_CHAIN: SimplifiedPermissionKey[] = [
  'read',
  'modify',
  'delete',
  'move',
]

export interface AdvancedPermissionDef {
  field: keyof FolderShareRights
  imapCode: string
  labelKey: string
}

// Order matches the IMAP ACL rights list (RFC 4314): l,r,s,w,i,p,k,x,t,e,a
export const ADVANCED_PERMISSIONS: AdvancedPermissionDef[] = [
  {
    field: 'userCanViewFolder',
    imapCode: 'l',
    labelKey: 'folders.actions.sharing.advanced.userCanViewFolder.string',
  },
  {
    field: 'userCanReadMails',
    imapCode: 'r',
    labelKey: 'folders.actions.sharing.advanced.userCanReadMails.string',
  },
  {
    field: 'userCanMarkMailsRead',
    imapCode: 's',
    labelKey: 'folders.actions.sharing.advanced.userCanMarkMailsRead.string',
  },
  {
    field: 'userCanWriteMails',
    imapCode: 'w',
    labelKey: 'folders.actions.sharing.advanced.userCanWriteMails.string',
  },
  {
    field: 'userCanInsertMails',
    imapCode: 'i',
    labelKey: 'folders.actions.sharing.advanced.userCanInsertMails.string',
  },
  {
    field: 'userCanPostMails',
    imapCode: 'p',
    labelKey: 'folders.actions.sharing.advanced.userCanPostMails.string',
  },
  {
    field: 'userCanCreateSubfolders',
    imapCode: 'k',
    labelKey: 'folders.actions.sharing.advanced.userCanCreateSubfolders.string',
  },
  {
    field: 'userCanRemoveFolder',
    imapCode: 'x',
    labelKey: 'folders.actions.sharing.advanced.userCanRemoveFolder.string',
  },
  {
    field: 'userCanEraseMails',
    imapCode: 't',
    labelKey: 'folders.actions.sharing.advanced.userCanEraseMails.string',
  },
  {
    field: 'userCanExpungeFolder',
    imapCode: 'e',
    labelKey: 'folders.actions.sharing.advanced.userCanExpungeFolder.string',
  },
  {
    field: 'userIsAdministrator',
    imapCode: 'a',
    labelKey: 'folders.actions.sharing.advanced.userIsAdministrator.string',
  },
]

function isOn(rights: FolderShareRights, field: keyof FolderShareRights): boolean {
  return rights[field] === 1
}

/** Whether 'delete' or 'modify' rights are on, which forces 'read' on too. */
export function isReadForced(rights: FolderShareRights): boolean {
  return (
    isOn(rights, 'userCanMarkMailsRead') ||
    isOn(rights, 'userCanWriteMails') ||
    isOn(rights, 'userCanEraseMails') ||
    isOn(rights, 'userCanExpungeFolder')
  )
}

/** Standing invariant: delete or modify rights imply read rights. */
export function enforceHierarchy(rights: FolderShareRights): FolderShareRights {
  if (!isReadForced(rights)) return rights
  return { ...rights, userCanViewFolder: 1, userCanReadMails: 1 }
}

export function computeSimplifiedStates(
  rights: FolderShareRights
): Record<SimplifiedPermissionKey, boolean> {
  const result = {} as Record<SimplifiedPermissionKey, boolean>
  for (const def of SIMPLIFIED_PERMISSIONS) {
    result[def.key] = def.fields.every((field) => isOn(rights, field))
  }
  return result
}

/**
 * Whether the simplified checkbox `key` must render checked+disabled because
 * a later permission in `SIMPLIFIED_CHAIN` is currently on. Only applies to
 * the 4 chained keys — always false for `administerRights`/
 * `administerSubfolders`, and irrelevant to the advanced checkboxes (the
 * chain is a simplified-view-only rule).
 */
export function isSimplifiedChainForced(
  rights: FolderShareRights,
  key: SimplifiedPermissionKey
): boolean {
  const index = SIMPLIFIED_CHAIN.indexOf(key)
  if (index === -1) return false
  const states = computeSimplifiedStates(rights)
  return SIMPLIFIED_CHAIN.slice(index + 1).some((laterKey) => states[laterKey])
}

/**
 * Standing invariant for the simplified view: checking a chain permission
 * implies every earlier one in `SIMPLIFIED_CHAIN` is on too. Re-derived from
 * scratch (not just patched around the toggled key) so it holds regardless
 * of which key was last touched — same "re-force, don't cascade-uncheck"
 * approach as `enforceHierarchy`.
 */
export function enforceSimplifiedChain(
  rights: FolderShareRights
): FolderShareRights {
  const states = computeSimplifiedStates(rights)
  let highestOnIndex = -1
  for (let i = SIMPLIFIED_CHAIN.length - 1; i >= 0; i--) {
    if (states[SIMPLIFIED_CHAIN[i]]) {
      highestOnIndex = i
      break
    }
  }
  if (highestOnIndex <= 0) return rights

  let next = rights
  for (let i = 0; i < highestOnIndex; i++) {
    const def = SIMPLIFIED_PERMISSIONS.find((d) => d.key === SIMPLIFIED_CHAIN[i])
    if (!def) continue
    for (const field of def.fields) {
      next = { ...next, [field]: 1 }
    }
  }
  return next
}

export function applySimplifiedToggle(
  rights: FolderShareRights,
  key: SimplifiedPermissionKey,
  checked: boolean
): FolderShareRights {
  const def = SIMPLIFIED_PERMISSIONS.find((d) => d.key === key)
  if (!def) return rights

  const next = { ...rights }
  for (const field of def.fields) {
    next[field] = checked ? 1 : 0
  }
  return enforceHierarchy(enforceSimplifiedChain(next))
}

export function applyAdvancedToggle(
  rights: FolderShareRights,
  field: keyof FolderShareRights,
  checked: boolean
): FolderShareRights {
  const next = { ...rights, [field]: checked ? 1 : 0 }
  return enforceHierarchy(next)
}

/** IMAP letter codes (e.g. ['r','s']) for every advanced right currently on. */
export function getActiveAdvancedCodes(rights: FolderShareRights): string[] {
  return ADVANCED_PERMISSIONS.filter((def) => isOn(rights, def.field)).map(
    (def) => def.imapCode
  )
}

/**
 * Rebuilds a full `FolderShareRights` object from the IMAP codes we always
 * send/receive over the wire now (e.g. ['l','r','s']) — the inverse of
 * `getActiveAdvancedCodes`. Used to reconstruct `rights` from `permissions`
 * alone, since `rights` itself isn't part of the wire payload.
 */
export function buildRightsFromPermissions(
  permissions: string[]
): FolderShareRights {
  const rights: FolderShareRights = {}
  for (const def of ADVANCED_PERMISSIONS) {
    if (permissions.includes(def.imapCode)) {
      rights[def.field] = 1
    }
  }
  return enforceHierarchy(rights)
}
