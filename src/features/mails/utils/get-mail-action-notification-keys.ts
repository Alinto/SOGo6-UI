import type { ApiNotificationStrings } from '@/features/notifications/api-notification-handler'

type MailActionType =
  | 'tag'
  | 'untag'
  | 'move'
  | 'spam'
  | 'ham'
  | 'copy'

function normalizeMailActionDataArray(
  data: string | string[] | null | undefined
): string[] {
  if (data == null) return []
  return Array.isArray(data) ? data : [data]
}

function isSeenFlagToggle(arg: {
  action: MailActionType
  data?: string | string[] | null
}): boolean {
  if (arg.action !== 'tag' && arg.action !== 'untag') return false
  return normalizeMailActionDataArray(arg.data).includes('\\Seen')
}

export function getMailActionNotificationKeys(arg: {
  action: MailActionType
  data?: string | string[] | null
}): ApiNotificationStrings | null {
  if (isSeenFlagToggle(arg)) return null

  switch (arg.action) {
    case 'spam':
      return {
        successTitle: 'mail_action.spam.successTitle.string',
        successMessage: 'mail_action.spam.successMessage.string',
        errorTitle: 'mail_action.spam.errorTitle.string',
        errorMessage: 'mail_action.spam.errorMessage.string',
      }
    case 'ham':
      return {
        successTitle: 'mail_action.ham.successTitle.string',
        successMessage: 'mail_action.ham.successMessage.string',
        errorTitle: 'mail_action.ham.errorTitle.string',
        errorMessage: 'mail_action.ham.errorMessage.string',
      }
    case 'move':
      return {
        successTitle: 'mail_action.move.successTitle.string',
        successMessage: 'mail_action.move.successMessage.string',
        errorTitle: 'mail_action.move.errorTitle.string',
        errorMessage: 'mail_action.move.errorMessage.string',
      }
    case 'tag':
      return {
        successTitle: 'mail_action.tag.successTitle.string',
        successMessage: 'mail_action.tag.successMessage.string',
        errorTitle: 'mail_action.tag.errorTitle.string',
        errorMessage: 'mail_action.tag.errorMessage.string',
      }
    case 'untag':
      return {
        successTitle: 'mail_action.untag_label.successTitle.string',
        successMessage: 'mail_action.untag_label.successMessage.string',
        errorTitle: 'mail_action.untag_label.errorTitle.string',
        errorMessage: 'mail_action.untag_label.errorMessage.string',
      }
    default:
      return null
  }
}
