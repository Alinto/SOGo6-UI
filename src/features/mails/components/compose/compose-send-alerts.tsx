'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslations } from 'next-intl'
import type { EmptyContentAlert } from '../../hooks/use-compose-send'

const EMPTY_CONTENT_ALERT_KEY: Record<EmptyContentAlert, string> = {
  subject: 'no_subject_alert',
  body: 'no_body_alert',
  both: 'no_subject_body_alert',
}

interface ComposeSendAlertsProps {
  showNoRecipientAlert: boolean
  onNoRecipientAlertOpenChange: (open: boolean) => void
  emptyContentAlert: EmptyContentAlert | null
  onEmptyContentAlertOpenChange: (open: boolean) => void
  onConfirmSendAnyway: () => void
}

export function ComposeSendAlerts({
  showNoRecipientAlert,
  onNoRecipientAlertOpenChange,
  emptyContentAlert,
  onEmptyContentAlertOpenChange,
  onConfirmSendAnyway,
}: ComposeSendAlertsProps) {
  const t = useTranslations('COMPOSE')

  return (
    <>
      <AlertDialog
        open={showNoRecipientAlert}
        onOpenChange={onNoRecipientAlertOpenChange}
      >
        <AlertDialogContent className="z-9999">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('no_recipient_alert.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('no_recipient_alert.content.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => onNoRecipientAlertOpenChange(false)}>
              {t('no_recipient_alert.ok.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={emptyContentAlert !== null}
        onOpenChange={onEmptyContentAlertOpenChange}
      >
        <AlertDialogContent className="z-9999">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {emptyContentAlert &&
                t(`${EMPTY_CONTENT_ALERT_KEY[emptyContentAlert]}.title.string`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {emptyContentAlert &&
                t(
                  `${EMPTY_CONTENT_ALERT_KEY[emptyContentAlert]}.content.string`
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => onEmptyContentAlertOpenChange(false)}
            >
              {t('empty_content_alert.cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmSendAnyway}>
              {t('empty_content_alert.send.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ComposeSendAlerts
