'use client'

import { Button } from '@/components/ui/button'
import LabelsFormSkeleton from '@/components/ui/skeletons/inputs'
import type { MfaEnrollBeginData } from '@/features/auth/components/store/auth.api'
import MfaCodeForm from '@/features/auth/mfa/mfa-code-form'
import { MFA_ERROR, mfaErrorKey } from '@/features/auth/mfa/mfa-errors'
import MfaPasswordForm from '@/features/auth/mfa/mfa-password-form'
import MfaSetupStep from '@/features/auth/mfa/mfa-setup-step'
import { getErrorCode } from '@/lib/redux/api/error-handlers'
import { useTranslations } from 'next-intl'
import React from 'react'
import {
  useBeginMfaSetupMutation,
  useConfirmMfaSetupMutation,
  useDisableMfaMutation,
  useGetMfaStatusQuery,
} from '../store/mfa-api'

/**
 * - idle: show the state and the actions
 * - password: first method, ask the password first (required by the backend)
 * - current_code: the user replaces a method, ask the code of the current one first
 * - setup: QR code + secret, ask one code to confirm
 * - disable: ask the current code to remove the method
 */
type Step =
  | { kind: 'idle' }
  | { kind: 'password'; provider: string }
  | { kind: 'current_code'; provider: string }
  | { kind: 'setup'; setup: MfaEnrollBeginData }
  | { kind: 'disable' }

/** Basic MFA screen, to validate the backend flow */
export function MfaSettings() {
  const t = useTranslations('MFA')
  const { data, error: loadError, isLoading } = useGetMfaStatusQuery()
  const [beginSetup, { isLoading: isStarting }] = useBeginMfaSetupMutation()
  const [confirmSetup, { isLoading: isConfirming }] =
    useConfirmMfaSetupMutation()
  const [disableMfa, { isLoading: isDisabling }] = useDisableMfaMutation()

  const [step, setStep] = React.useState<Step>({ kind: 'idle' })
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const status = data?.data

  const reset = () => {
    setStep({ kind: 'idle' })
    setError(null)
  }

  // Proof required by the backend: the code of the current method to replace it,
  // the password to set up the first one
  const start = async (
    provider: string,
    proof: { code?: string; password?: string }
  ) => {
    setError(null)
    setInfo(null)
    try {
      const result = await beginSetup({ provider, ...proof }).unwrap()
      setStep({ kind: 'setup', setup: result.data })
    } catch (err: unknown) {
      const code = getErrorCode(err)
      if (code === MFA_ERROR.PASSWORD_REQUIRED) {
        setStep({ kind: 'password', provider })
      } else if (code === MFA_ERROR.CODE_REQUIRED) {
        // A method was set up meanwhile (e.g. from another session)
        setStep({ kind: 'current_code', provider })
      }
      setError(t(mfaErrorKey(err)))
    }
  }

  const onChooseMethod = (provider: string) => {
    setError(null)
    setInfo(null)
    setStep(
      status?.method
        ? { kind: 'current_code', provider }
        : { kind: 'password', provider }
    )
  }

  const onConfirm = async (code: string) => {
    setError(null)
    try {
      await confirmSetup({ code }).unwrap()
      setStep({ kind: 'idle' })
      // The backend revokes the other sessions of the user
      setInfo(
        `${t('settings.enabled_ok.string')} ${t('settings.sessions_revoked.string')}`
      )
    } catch (err: unknown) {
      setError(t(mfaErrorKey(err)))
    }
  }

  const onDisable = async (code: string) => {
    setError(null)
    try {
      await disableMfa({ code }).unwrap()
      setStep({ kind: 'idle' })
      setInfo(
        `${t('settings.disabled_ok.string')} ${t('settings.sessions_revoked.string')}`
      )
    } catch (err: unknown) {
      setError(t(mfaErrorKey(err)))
    }
  }

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString() : '-'

  let body: React.ReactNode
  if (isLoading) {
    body = <LabelsFormSkeleton />
  } else if (loadError || !status) {
    body = (
      <p className="text-destructive text-sm">{t(mfaErrorKey(loadError))}</p>
    )
  } else if (!status.enabled) {
    body = <p className="text-sm">{t('settings.not_available.string')}</p>
  } else if (step.kind === 'setup') {
    body = (
      <MfaSetupStep
        setup={step.setup}
        onConfirm={onConfirm}
        isLoading={isConfirming}
      />
    )
  } else if (step.kind === 'password') {
    body = (
      <div className="grid gap-2">
        <p className="text-sm">{t('settings.password.string')}</p>
        <MfaPasswordForm
          id="mfa-password"
          onSubmit={(password) => start(step.provider, { password })}
          isLoading={isStarting}
          submitLabel={t('settings.continue.string')}
        />
      </div>
    )
  } else if (step.kind === 'current_code') {
    body = (
      <div className="grid gap-2">
        <p className="text-sm">{t('settings.current_code.string')}</p>
        <MfaCodeForm
          id="mfa-current-code"
          onSubmit={(code) => start(step.provider, { code })}
          isLoading={isStarting}
          submitLabel={t('settings.continue.string')}
        />
      </div>
    )
  } else if (step.kind === 'disable') {
    body = (
      <div className="grid gap-2">
        <p className="text-sm">{t('settings.disable_code.string')}</p>
        <MfaCodeForm
          id="mfa-disable-code"
          onSubmit={onDisable}
          isLoading={isDisabling}
          submitLabel={t('settings.disable.string')}
        />
      </div>
    )
  } else {
    body = (
      <div className="grid gap-3 text-sm">
        {status.method ? (
          <div>
            <p>
              {t('settings.active.string', { method: status.method.provider })}
            </p>
            <p className="text-muted-foreground">
              {t('settings.created_at.string', {
                date: formatDate(status.method.created_at),
              })}
            </p>
            <p className="text-muted-foreground">
              {t('settings.last_used_at.string', {
                date: formatDate(status.method.last_used_at),
              })}
            </p>
          </div>
        ) : (
          <p>{t('settings.inactive.string')}</p>
        )}
        {status.enforced && (
          <p className="text-muted-foreground">
            {t('settings.enforced.string')}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {status.allowed_methods.map((method) => (
            <Button
              key={method}
              type="button"
              variant="outline"
              disabled={isStarting}
              onClick={() => onChooseMethod(method)}
            >
              {status.method
                ? t('settings.replace.string', { method })
                : t('settings.enable.string', { method })}
            </Button>
          ))}
          {status.method && !status.enforced && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInfo(null)
                setStep({ kind: 'disable' })
              }}
            >
              {t('settings.disable.string')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <h3 className="mb-2 text-lg">{t('settings.title.string')}</h3>
      {error && <p className="text-destructive mb-2 text-sm">{error}</p>}
      {info && <p className="mb-2 text-sm">{info}</p>}
      {body}
      {step.kind !== 'idle' && (
        <Button
          type="button"
          variant="link"
          className="mt-2 px-0"
          onClick={reset}
        >
          {t('settings.cancel.string')}
        </Button>
      )}
    </div>
  )
}

export default MfaSettings
