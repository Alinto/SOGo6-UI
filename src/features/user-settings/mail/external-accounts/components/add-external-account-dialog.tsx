'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useCreateUserMailboxMutation } from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'
import { useTranslations } from 'next-intl'
import { MODE_CREATE } from '../external-accounts-utils'
import ExternalAccountForm from './external-accounts-edit-form'

interface AddExternalAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExternalAccountDialog({
  open,
  onOpenChange,
}: AddExternalAccountDialogProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const [create] = useCreateUserMailboxMutation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogTitle className="sr-only">{t('new.title.string')}</DialogTitle>
        <ExternalAccountForm
          embedded
          mode={MODE_CREATE}
          error={null}
          manageData={create}
          onBack={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
