// API Response Types for /profile endpoint

import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../store/user-preferences-api-types'

export interface Signature {
  [signatureName: string]: string
}

export interface Identity {
  isDefault: boolean
  mail: string
  name: string
  replyTo: string
  signatures: Signature
}

export interface Mailbox {
  certificates: Record<string, unknown>
  id: string
  identities: Identity[]
  receipts: Record<string, unknown>
}

export interface UIConfig {
  SOGO_D_ALLOW_EXT_MAIL_ACCOUNT: boolean
  SOGO_D_AUTOCOMPLETION_MIN_LEN: number
  SOGO_D_CALDAV_ENABLED: boolean
  SOGO_D_CALDAV_PUBLIC_ACCESS_ENABLE: boolean
  SOGO_D_CARDAV_ENABLED: boolean
  SOGO_D_CARDAV_PUBLIC_ACCESS_ENABLE: boolean
  SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED?: boolean
  SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED?: boolean
  SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED?: boolean
  SOGO_D_IDENTITIES_ENABLED?: boolean
  [key: string]: unknown
}

export interface ProfileApiResponse {
  data: {
    mailboxes: Mailbox[]
    ui: UIConfig
    // Additional profile fields
    uid?: string
    mail?: string
    cn?: string
    company?: string
    team?: string
    aliases?: string[]
    profilePictureSource?: string // URL or data URI
  }
}

// Form submission types
export interface ProfileFormData {
  // Basic info (read-only from API)
  uid: string
  mail: string
  cn: string
  profilePictureSource:
    | typeof PP_USERSOURCE
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_DEFAULT

  // Extra info
  company: string
  team: string
  aliases: string[]

  // Identities
  identities: Array<{
    mail: string
    name: string
    replyTo: string
    isDefault: boolean
    signatures: Signature
  }>
}
