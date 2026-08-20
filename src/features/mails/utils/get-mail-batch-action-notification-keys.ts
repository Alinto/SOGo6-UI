import type { ApiNotificationProps } from '@/features/notifications/api-notification-handler'
import type { MailBatchActionType } from '../mails-types'
import {
  isMailActionSeenFlagToggle,
  normalizeMailActionDataArray,
} from '../store/mails-cache'

function isFlaggedToggle(arg: {
  action: MailBatchActionType
  data?: string | string[] | null
}): boolean {
  if (arg.action !== 'tag' && arg.action !== 'untag') return false
  return normalizeMailActionDataArray(arg.data).includes('\\Flagged')
}

export function getMailBatchActionNotificationKeys(arg: {
  action: MailBatchActionType
  data?: string | string[] | null
}): ApiNotificationProps | null {
  if (isMailActionSeenFlagToggle(arg)) return null

  if (isFlaggedToggle(arg)) {
    return arg.action === 'tag'
      ? {
          successTitle: 'mail_action.bulk_flag.successTitle.string',
          successMessage: 'mail_action.bulk_flag.successMessage.string',
          errorTitle: 'mail_action.bulk_flag.errorTitle.string',
          errorMessage: 'mail_action.bulk_flag.errorMessage.string',
        }
      : {
          successTitle: 'mail_action.bulk_unflag.successTitle.string',
          successMessage: 'mail_action.bulk_unflag.successMessage.string',
          errorTitle: 'mail_action.bulk_unflag.errorTitle.string',
          errorMessage: 'mail_action.bulk_unflag.errorMessage.string',
        }
  }

  switch (arg.action) {
    case 'delete':
      return {
        successTitle: 'mail_action.bulk_delete.successTitle.string',
        successMessage: 'mail_action.bulk_delete.successMessage.string',
        errorTitle: 'mail_action.bulk_delete.errorTitle.string',
        errorMessage: 'mail_action.bulk_delete.errorMessage.string',
      }
    case 'spam':
      return {
        successTitle: 'mail_action.bulk_spam.successTitle.string',
        successMessage: 'mail_action.bulk_spam.successMessage.string',
        errorTitle: 'mail_action.bulk_spam.errorTitle.string',
        errorMessage: 'mail_action.bulk_spam.errorMessage.string',
      }
    case 'ham':
      return {
        successTitle: 'mail_action.bulk_ham.successTitle.string',
        successMessage: 'mail_action.bulk_ham.successMessage.string',
        errorTitle: 'mail_action.bulk_ham.errorTitle.string',
        errorMessage: 'mail_action.bulk_ham.errorMessage.string',
      }
    case 'move':
      return {
        successTitle: 'mail_action.bulk_move.successTitle.string',
        successMessage: 'mail_action.bulk_move.successMessage.string',
        errorTitle: 'mail_action.bulk_move.errorTitle.string',
        errorMessage: 'mail_action.bulk_move.errorMessage.string',
      }
    case 'copy':
      return {
        successTitle: 'mail_action.bulk_copy.successTitle.string',
        successMessage: 'mail_action.bulk_copy.successMessage.string',
        errorTitle: 'mail_action.bulk_copy.errorTitle.string',
        errorMessage: 'mail_action.bulk_copy.errorMessage.string',
      }
    case 'tag':
      return {
        successTitle: 'mail_action.bulk_tag.successTitle.string',
        successMessage: 'mail_action.bulk_tag.successMessage.string',
        errorTitle: 'mail_action.bulk_tag.errorTitle.string',
        errorMessage: 'mail_action.bulk_tag.errorMessage.string',
      }
    case 'untag':
      return {
        successTitle: 'mail_action.bulk_untag.successTitle.string',
        successMessage: 'mail_action.bulk_untag.successMessage.string',
        errorTitle: 'mail_action.bulk_untag.errorTitle.string',
        errorMessage: 'mail_action.bulk_untag.errorMessage.string',
      }
    default:
      return null
  }
}
