'use client'

import { Button } from '@/components/ui/button'
import { useMfaVerifyMutation } from '@/features/auth/components/store/auth.api'
import {
  clearMfaPending,
  selectMfaPending,
} from '@/features/auth/components/store/auth.slice'
import { useCompleteLogin } from '@/features/auth/hooks/use-complete-login'
import MfaCodeForm from '@/features/auth/mfa/mfa-code-form'
import {
  isMfaLoginSessionLost,
  mfaErrorKey,
} from '@/features/auth/mfa/mfa-errors'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import React from 'react'
import LoginErrorNotice from './login-error-notice'

/** Second login step: the user has an MFA method and gives its code */
export function LoginMfaVerifyForm() {
  const t = useTranslations('MFA')
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const pending = useAppSelector(selectMfaPending)
  const completeLogin = useCompleteLogin()
  const [mfaVerify, { isLoading }] = useMfaVerifyMutation()
  const [error, setError] = React.useState<string | null>(null)
  const [sessionLost, setSessionLost] = React.useState(false)

  const hasSession = pending?.stage === 'verify'

  React.useEffect(() => {
    // Page reloaded or opened directly: the MFA token is only kept in memory
    if (!hasSession && !sessionLost) push('/auth/login')
  }, [hasSession, sessionLost, push])

  const backToLogin = () => {
    dispatch(clearMfaPending())
    push('/auth/login')
  }

  const onSubmit = async (code: string) => {
    if (!pending) return
    setError(null)
    try {
      const result = await mfaVerify({ code }).unwrap()
      completeLogin(result.data.jwt_token, pending.rememberMe)
    } catch (err: unknown) {
      setError(t(mfaErrorKey(err)))
      if (isMfaLoginSessionLost(err)) {
        setSessionLost(true)
        dispatch(clearMfaPending())
      }
    }
  }

  if (!hasSession && !sessionLost) return null

  return (
    <div className="text-primary-foreground mx-auto flex w-full max-w-xs flex-col gap-4">
      <h1 className="text-lg font-medium">{t('verify.title.string')}</h1>
      {error && <LoginErrorNotice>{error}</LoginErrorNotice>}
      {sessionLost ? (
        <Button type="button" variant="outline" onClick={backToLogin}>
          {t('back_to_login.string')}
        </Button>
      ) : (
        <>
          <p className="text-sm">{t('verify.description.string')}</p>
          <MfaCodeForm
            id="mfa-verify-code"
            onSubmit={onSubmit}
            isLoading={isLoading}
            submitLabel={t('verify.submit.string')}
          />
          <Button type="button" variant="link" onClick={backToLogin}>
            {t('back_to_login.string')}
          </Button>
        </>
      )}
    </div>
  )
}

export default LoginMfaVerifyForm
