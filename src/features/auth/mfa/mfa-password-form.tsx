'use client'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/inputs/input-password'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import React from 'react'

interface Props {
  id: string
  onSubmit: (password: string) => void
  isLoading?: boolean
  submitLabel: string
  className?: string
}

/**
 * Asks the password of the user, required by the backend to set up the first
 * MFA method from a user session (a stolen session must not bind the account
 * to another device)
 */
export function MfaPasswordForm({
  id,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: Props) {
  const t = useTranslations('MFA')
  const [password, setPassword] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // The password is sent as typed: no trim
    if (password) onSubmit(password)
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="mb-4 grid gap-2">
        <Label htmlFor={id}>{t('password.label.string')}</Label>
        <PasswordInput
          id={id}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          maxLength={1024}
          autoFocus
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !password}>
        {submitLabel}
      </Button>
    </form>
  )
}

export default MfaPasswordForm
