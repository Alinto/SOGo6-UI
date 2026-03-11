'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import LabelsFormSkeleton from '@/components/ui/skeletons/inputs'
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesSecurityMutation,
} from '@/features/user-settings/store/user-preferences-api'
import PasswordForm from './components/password-form'
import TotpSettingsForm from './components/totp-form'

const TotpSettings: React.FC = () => {
  const t = useTranslations('US_SECURITY')
  const { data, error, isFetching } = useGetUserPreferencesQuery()
  const [updateSecurity] = useUpdateUserPreferencesSecurityMutation()
  if (error) {
    return 'ERROR' //TODO
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        <LabelsFormSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <PasswordForm />
          <TotpSettingsForm data={data?.data} update={updateSecurity} />
        </div>
      )}
    </div>
  )
}

export default TotpSettings
