'use client'

import { Button } from '@/components/ui/button'
import {
  type MfaEnrollBeginData,
  useMfaEnrollBeginMutation,
  useMfaEnrollConfirmMutation,
} from '@/features/auth/components/store/auth.api'
import {
  clearMfaPending,
  selectMfaPending,
} from '@/features/auth/components/store/auth.slice'
import { useCompleteLogin } from '@/features/auth/hooks/use-complete-login'
import {
  isMfaLoginSessionLost,
  mfaErrorKey,
} from '@/features/auth/mfa/mfa-errors'
import MfaSetupStep from '@/features/auth/mfa/mfa-setup-step'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import React from 'react'
import LoginErrorNotice from './login-error-notice'

/**
 * Forced enrollment at login: MFA is enforced and the user has no method.
 * Choose a method (if several), scan the QR code, confirm with one code:
 * the backend then issues the user session.
 */
export function LoginMfaEnrollForm() {
  const t = useTranslations('MFA')
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const pending = useAppSelector(selectMfaPending)
  const completeLogin = useCompleteLogin()
  const [enrollBegin, { isLoading: isStarting }] = useMfaEnrollBeginMutation()
  const [enrollConfirm, { isLoading: isConfirming }] =
    useMfaEnrollConfirmMutation()
  const [setup, setSetup] = React.useState<MfaEnrollBeginData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionLost, setSessionLost] = React.useState(false)

  const hasSession = pending?.stage === 'enroll'

  React.useEffect(() => {
    // Page reloaded or opened directly: the MFA token is only kept in memory
    if (!hasSession && !sessionLost) push('/auth/login')
  }, [hasSession, sessionLost, push])

  const backToLogin = () => {
    dispatch(clearMfaPending())
    push('/auth/login')
  }

  const handleError = (err: unknown) => {
    setError(t(mfaErrorKey(err)))
    if (isMfaLoginSessionLost(err)) {
      setSessionLost(true)
      dispatch(clearMfaPending())
    }
  }

  const start = async (provider: string) => {
    setError(null)
    try {
      const result = await enrollBegin({ provider }).unwrap()
      setSetup(result.data)
    } catch (err: unknown) {
      handleError(err)
    }
  }

  const confirm = async (code: string) => {
    if (!pending) return
    setError(null)
    try {
      const result = await enrollConfirm({ code }).unwrap()
      setSetup(null)
      completeLogin(result.data.jwt_token, pending.rememberMe)
    } catch (err: unknown) {
      handleError(err)
    }
  }

  if (!hasSession && !sessionLost) return null

  return (
    <div className="text-primary-foreground mx-auto flex w-full max-w-xs flex-col gap-4">
      <h1 className="text-lg font-medium">{t('enroll.title.string')}</h1>
      {error && <LoginErrorNotice>{error}</LoginErrorNotice>}
      {sessionLost ? (
        <Button type="button" variant="outline" onClick={backToLogin}>
          {t('back_to_login.string')}
        </Button>
      ) : (
        <>
          <p className="text-sm">{t('enroll.description.string')}</p>
          {setup ? (
            <MfaSetupStep
              setup={setup}
              onConfirm={confirm}
              isLoading={isConfirming}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {pending?.allowedMethods.map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant="outline"
                  disabled={isStarting}
                  onClick={() => start(method)}
                >
                  {t('enroll.start.string', { method })}
                </Button>
              ))}
            </div>
          )}
          <Button type="button" variant="link" onClick={backToLogin}>
            {t('back_to_login.string')}
          </Button>
        </>
      )}
    </div>
  )
}

export default LoginMfaEnrollForm
