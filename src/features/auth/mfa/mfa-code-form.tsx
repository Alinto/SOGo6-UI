'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import React from 'react'

interface Props {
  id: string
  onSubmit: (code: string) => void
  isLoading?: boolean
  submitLabel: string
  className?: string
}

/** Basic form with one MFA code field (6 digits for TOTP) */
export function MfaCodeForm({
  id,
  onSubmit,
  isLoading = false,
  submitLabel,
  className,
}: Props) {
  const t = useTranslations('MFA')
  const [code, setCode] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = code.replace(/\s/g, '')
    if (value) onSubmit(value)
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="mb-4 grid gap-2">
        <Label htmlFor={id}>{t('code.label.string')}</Label>
        <Input
          id={id}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={64}
          autoFocus
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !code.trim()}>
        {submitLabel}
      </Button>
    </form>
  )
}

export default MfaCodeForm
