'use client'

import { useProfile } from '@/features/user-profile'
import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { useTranslations } from 'next-intl'
import React from 'react'
import MailVacationSettingsForm from './components/vacation-form'
import VacationSettingsSkeleton from './components/vacation-skeleton'
import {
  useGetMailVacationSettingsQuery,
  useUpdateMailVacationSettingsMutation,
} from './store/mail-vacation-settings-api'

const MailVacationSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_VACATIONS')
  const { mainAccount, timezone, vacationAllowResponseAlways } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data, error, isLoading } = useGetMailVacationSettingsQuery({
    accountId,
  })
  const [updateData] = useUpdateMailVacationSettingsMutation()

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<VacationSettingsSkeleton />}
    >
      <MailVacationSettingsForm
        data={data}
        accountId={accountId}
        timezone={timezone}
        vacationAllowResponseAlways={vacationAllowResponseAlways}
        update={updateData}
      />
    </SettingsAsyncPage>
  )
}

export default MailVacationSettings
