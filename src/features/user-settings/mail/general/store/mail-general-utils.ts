import type { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'

import type { UserMailGeneral } from '@/features/user-settings/store/user-preferences-api-types'
import { MailGeneralSettings } from '../../../store/user-preferences-types'

export function mapMailGeneralSettingsToApi(
  values: MailGeneralSettings
): UserMailGeneral {
  return {
    SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE: values.mailfolderSubscribe,
    SOGO_U_SHOW_ALL_UNSEEN_COUNT: values.countAllUnseen,
    SOGO_U_SORT_BY_THREAD: values.sortByThreads,
    SOGO_U_MAIL_FORWARDING_FORMAT: values.forwardMessages,
    SOGO_U_ATTACHMENT_POSITION: values.hideInlineAttachments
      ? 'below'
      : 'above',
    SOGO_U_HIDE_INLINE_ATTACHMENT: values.hideInlineAttachments,
    SOGO_U_DISPLAY_REMOTE_INLINE: values.displayRemoteImages,
    SOGO_U_REPLY_POSITION: values.startReply,
    SOGO_U_SIGNATURE_POSITION: values.placeSignature,
    SOGO_U_USE_SIGNATURE: [
      values.signOnNew ? 'new' : null,
      values.signOnReply ? 'reply' : null,
      values.signOnForward ? 'forward' : null,
    ].filter((e): e is 'new' | 'reply' | 'forward' => e !== null),
    SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT:
      values.composeIn === 'html' ? 'html' : 'text',
    SOGO_U_COMPOSE_MAIL_WINDOW:
      values.composeMailWindow === 'popup' ? 'popup' : 'inline',
    SOGO_U_MARK_READ_DELAY: values.autoMarkAsReadDelay,
    SOGO_U_DRAFT_AUTOSAVE: values.draftAutosave,
    SOGO_U_MAIL_ALLOW_RECEIPT: values.mailAllowReceipt,
    SOGO_U_COLLECT_UNKNWON_ADDRESSES: values.collectUnknownAddresses,
    SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME:
      values.collectUnknownAddressbookName,
  }
}

export function mapApiToMailGeneralSettings(
  data: UserPreferences
): MailGeneralSettings {
  return {
    draftAutosave: data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_DRAFT_AUTOSAVE || 0,
    attachmentPosition:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_ATTACHMENT_POSITION === 'below'
        ? 'below'
        : 'above',
    autoMarkAsReadDelay:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_MARK_READ_DELAY || 0,
    collectUnknownAddresses:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_COLLECT_UNKNWON_ADDRESSES ||
      false,
    collectUnknownAddressbookName:
      data.USER_MAIL_GENERAL_SETTINGS
        ?.SOGO_U_COLLECT_UNKNWON_ADDRESSBOOK_NAME || '',
    mailAllowReceipt:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_MAIL_ALLOW_RECEIPT || false,
    mailfolderSubscribe:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_ALLOW_MAILFOLDER_SUBSCRIBE ||
      false,
    countAllUnseen:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_SHOW_ALL_UNSEEN_COUNT || false,
    sortByThreads:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_SORT_BY_THREAD || false,
    forwardMessages:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_MAIL_FORWARDING_FORMAT ||
      'inline',
    hideInlineAttachments:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_HIDE_INLINE_ATTACHMENT || false,
    displayRemoteImages:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_DISPLAY_REMOTE_INLINE || false,
    startReply:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_REPLY_POSITION || 'above',
    placeSignature:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_SIGNATURE_POSITION || 'below',
    signOnNew: (
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_USE_SIGNATURE || []
    ).includes('new'),
    signOnReply: (
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_USE_SIGNATURE || []
    ).includes('reply'),
    signOnForward: (
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_USE_SIGNATURE || []
    ).includes('forward'),
    composeIn:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT ===
      'html'
        ? 'html'
        : 'text',
    composeMailWindow:
      data.USER_MAIL_GENERAL_SETTINGS?.SOGO_U_COMPOSE_MAIL_WINDOW === 'popup'
        ? 'popup'
        : 'inline',
  }
}
