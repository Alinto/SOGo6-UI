'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import MfaSettings from './components/mfa-settings'
import PasswordForm from './components/password-form'

const SecuritySettings: React.FC = () => {
  const t = useTranslations('US_SECURITY')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      <div className="grid grid-cols-1 gap-4">
        <PasswordForm />
        <MfaSettings />
      </div>
    </div>
  )
}

export default SecuritySettings
