'use client'

import QRCode from '@/components/ui/qrcode'
import type { MfaEnrollBeginData } from '@/features/auth/components/store/auth.api'
import { useTranslations } from 'next-intl'
import MfaCodeForm from './mfa-code-form'

interface Props {
  setup: MfaEnrollBeginData
  onConfirm: (code: string) => void
  isLoading?: boolean
}

/**
 * Second half of a method setup (forced enrollment and preferences):
 * show the QR code and the secret, then ask one code to confirm.
 */
export function MfaSetupStep({ setup, onConfirm, isLoading }: Props) {
  const t = useTranslations('MFA')

  return (
    <div className="grid gap-4">
      <p className="text-sm">{t('setup.scan.string')}</p>
      {setup.otpauth_uri && (
        <div>
          <QRCode text={setup.otpauth_uri} />
        </div>
      )}
      {setup.secret && (
        <div className="text-sm">
          <p>{t('setup.manual.string')}</p>
          <code className="font-mono break-all select-all">{setup.secret}</code>
        </div>
      )}
      <MfaCodeForm
        id="mfa-setup-code"
        onSubmit={onConfirm}
        isLoading={isLoading}
        submitLabel={t('setup.confirm.string')}
      />
    </div>
  )
}

export default MfaSetupStep
