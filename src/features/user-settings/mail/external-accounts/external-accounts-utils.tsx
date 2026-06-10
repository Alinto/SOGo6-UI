import { schemaType } from './components/external-accounts-schema'

export const MODE_CREATE = 'create'
export const MODE_EDIT = 'edit'
export const MODE_LIST = 'list'

export const MAIL_SERVER = 'mail_server'
export const MAIL_OUTGOING = 'mail_outgoing'

export const FAKE_PASSWORD_SENTINEL = '__UNCHANGED_PASSWORD__'
// ---------------------------------------------------------------------------
// Utility — strip unchanged sentinel passwords before submitting a PATCH
// ---------------------------------------------------------------------------

/**
 * Call this on your form values before sending them to the PATCH endpoint.
 * Any password field that still holds the sentinel (i.e. the user never
 * touched it) is omitted from the payload so the API doesn't overwrite
 * the stored credential with a garbage value.
 *
 * Usage:
 *   const payload = stripUnchangedPasswords(form.getValues())
 *   await patchMailbox(mailboxId, payload)
 */
export function stripUnchangedPasswords(values: schemaType): schemaType {
  const out = JSON.parse(JSON.stringify(values)) as Record<string, unknown>

  for (const key of [MAIL_SERVER, MAIL_OUTGOING] as const) {
    const section = out[key] as Record<string, unknown> | undefined
    if (section && section['password'] === FAKE_PASSWORD_SENTINEL) {
      delete section['password']
    }
  }

  return out as schemaType
}
