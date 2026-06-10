import { FAKE_PASSWORD_SENTINEL } from '../external-accounts-utils'
import { IMAP, Mailbox, MailboxPOST, SMTP } from './mailboxes-api-types'

import { MailboxSettings } from './mailboxes-form-types'

/**
 * Maps API Mailbox to form values (for editing)
 */
export function mapApiToMailboxSettings(mailbox: Mailbox): MailboxSettings {
  return {
    id: mailbox.id,
    name: mailbox.name,
    mail_server: {
      server: mailbox.mail_server?.server,
      port: mailbox.mail_server?.port,
      encryption: mailbox.mail_server?.encryption,
      password: FAKE_PASSWORD_SENTINEL,
      username: mailbox.mail_server?.username,
      auth_mech: mailbox.mail_server?.auth_mech,
    },
    mail_outgoing: {
      server: mailbox.mail_outgoing?.server,
      port: mailbox.mail_outgoing?.port,
      encryption: mailbox.mail_outgoing?.encryption,
      password: FAKE_PASSWORD_SENTINEL,
      username: mailbox.mail_outgoing?.username,
      auth_mech: mailbox.mail_outgoing?.auth_mech,
    },
    identities: mailbox.identities?.map((identity) => ({
      mail: identity.mail,
      name: identity.name,
      replyTo: identity.replyTo,
      isDefault: identity.isDefault,
      signatures: identity.signatures ?? {},
    })),
    // certificates: mailbox.certificates ?? {},
    receipts: {
      enabled: mailbox.receipts?.enabled ?? false,
      not_to_cc: mailbox.receipts?.not_to_cc ?? 'never',
      outside_domain: mailbox.receipts?.outside_domain ?? 'never',
      other: mailbox.receipts?.other ?? 'never',
    },
  }
}

/**
 * Maps form values back to API payload (for PUT/PATCH)
 */
function mapMailboxSettingsToApiBase(
  values: MailboxSettings
): MailboxPOST | Mailbox {
  return {
    name: values.name,
    mail_server: {
      server: values.mail_server?.server,
      port: values.mail_server?.port,
      encryption: values.mail_server?.encryption,
      type: IMAP,
      password: values.mail_server?.password,
      username: values.mail_server?.username,
      auth_mech: values.mail_server?.auth_mech,
    },
    mail_outgoing: {
      server: values.mail_outgoing?.server,
      port: values.mail_outgoing?.port,
      encryption: values.mail_outgoing?.encryption,
      type: SMTP,
      password: values.mail_outgoing?.password,
      username: values.mail_outgoing?.username,
      auth_mech: values.mail_outgoing?.auth_mech,
    },
    identities: values.identities?.map((identity) => ({
      mail: identity.mail,
      name: identity.name,
      replyTo: identity.replyTo,
      isDefault: identity.isDefault,
      signatures: identity.signatures ?? {},
    })),
    // certificates: values.certificates ?? {},
    receipts: {
      enabled: values.receipts.enabled,
      not_to_cc: values.receipts.not_to_cc,
      outside_domain: values.receipts.outside_domain,
      other: values.receipts.other,
    },
  }
}

export function mapMailboxSettingsToApi(values: MailboxSettings): Mailbox {
  return { id: values.id, ...mapMailboxSettingsToApiBase(values) }
}

export function mapMailboxSettingsToApiCreate(
  values: MailboxSettings
): MailboxPOST {
  return mapMailboxSettingsToApiBase(values)
}

/**
 * Maps form values to API payload for creation (no id)
 */
export function mapMailboxSettingsToApiPOST(
  values: MailboxSettings
): MailboxPOST {
  const { id: _, ...rest } = mapMailboxSettingsToApi(values as MailboxSettings)
  return rest
}
